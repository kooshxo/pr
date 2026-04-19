import express from "express"
import fetch from "node-fetch"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Body parsing for POST requests
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }))

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}))

app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/proxy", limiter)

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(url) {
  return url
}

function getCachedResponse(url) {
  const key = getCacheKey(url)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedResponse(url, data, contentType) {
  const key = getCacheKey(url)
  cache.set(key, {
    timestamp: Date.now(),
    data: { buffer: data, contentType }
  })
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// Cache stats endpoint
app.get("/cache/stats", (req, res) => {
  res.json({
    size: cache.size,
    maxSize: 1000,
    ttl: CACHE_TTL / 1000 + 's'
  })
})

// Clear cache endpoint
app.post("/cache/clear", (req, res) => {
  cache.clear()
  res.json({ message: "Cache cleared" })
})

// proxy route
app.all("/proxy", async (req, res) => {
  try {
    const target = req.query.url

    if (!target) {
      return res.status(400).json({ error: "Missing URL parameter" })
    }

    // Validate URL
    let url
    try {
      url = new URL(target)
    } catch {
      return res.status(400).json({ error: "Invalid URL format" })
    }

    // Block private IPs
    const hostname = url.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return res.status(403).json({ error: "Access to private networks is not allowed" })
    }

    // Check cache for GET requests
    if (req.method === 'GET') {
      const cached = getCachedResponse(target)
      if (cached) {
        res.setHeader("Content-Type", cached.contentType)
        res.setHeader("X-Cache", "HIT")
        return res.send(cached.buffer)
      }
    }

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "DNT": "1",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
      "Host": url.host,
      "Referer": url.origin
    }

    // Forward relevant headers from client
    const forwardHeaders = ['cookie', 'authorization']
    forwardHeaders.forEach(header => {
      if (req.headers[header]) {
        fetchHeaders[header] = req.headers[header]
      }
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    // Prepare body for POST/PUT/PATCH requests
    let body = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      if (Buffer.isBuffer(req.body)) {
        body = req.body
      } else if (typeof req.body === 'string') {
        body = req.body
      } else {
        body = JSON.stringify(req.body)
      }
      
      // Set content-type if not present and body exists
      if (body && !fetchHeaders['content-type'] && req.headers['content-type']) {
        fetchHeaders['content-type'] = req.headers['content-type']
      }
    }

    const response = await fetch(target, {
      method: req.method,
      headers: fetchHeaders,
      body: body,
      redirect: 'manual',
      compress: true,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (location) {
        try {
          const redirectUrl = new URL(location, target).href
          res.setHeader("Location", `/proxy?url=${encodeURIComponent(redirectUrl)}`)
        } catch {
          res.setHeader("Location", location)
        }
      }
      return res.status(response.status).send('')
    }

    // Process HTML responses
    if (contentType.includes("text/html")) {
      const html = await response.text()
      const base = new URL(target)

      // Inject enhanced proxy script with authentication support
      const injectScript = `
<script>
(function() {
  const backendUrl = '${req.protocol}://${req.get('host')}';
  const targetUrl = '${target}';
  
  // Helper to proxy URLs
  function proxyUrl(url) {
    if (typeof url !== 'string') return url;
    if (!url) return url;
    
    // Already proxied
    if (url.startsWith(backendUrl + '/proxy')) return url;
    
    // Relative URLs
    if (!url.startsWith('http') && !url.startsWith('//')) {
      return backendUrl + '/proxy?url=' + encodeURIComponent(new URL(url, targetUrl).href);
    }
    
    // External URLs
    if (url.startsWith('//')) {
      return backendUrl + '/proxy?url=' + encodeURIComponent('https:' + url);
    }
    
    if (url.startsWith('http')) {
      return backendUrl + '/proxy?url=' + encodeURIComponent(url);
    }
    
    return url;
  }
  
  // Override fetch
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    const proxiedUrl = proxyUrl(url);
    
    // Ensure credentials are included for authentication
    options = options || {};
    if (!options.credentials) {
      options.credentials = 'include';
    }
    
    return originalFetch(proxiedUrl, options);
  };
  
  // Override XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    let requestUrl = '';
    
    xhr.open = function(method, url, ...args) {
      requestUrl = proxyUrl(url);
      return originalOpen.call(this, method, requestUrl, ...args);
    };
    
    xhr.send = function(body) {
      // Ensure cookies are sent with credentials
      xhr.withCredentials = true;
      return originalSend.call(this, body);
    };
    
    return xhr;
  };
  
  // Override window.open for popups
  const originalOpen = window.open;
  window.open = function(url, target, features) {
    if (url) {
      url = proxyUrl(url);
    }
    return originalOpen.call(this, url, target, features);
  };
  
  // Handle form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
      // Proxy the action URL
      const action = form.getAttribute('action') || '';
      if (action && !action.startsWith(backendUrl)) {
        form.setAttribute('action', proxyUrl(action));
      }
      
      // Ensure credentials are included
      if (!form.hasAttribute('data-proxy-credentials')) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = '_proxy_credentials';
        hiddenInput.value = 'include';
        form.appendChild(hiddenInput);
        form.setAttribute('data-proxy-credentials', 'true');
      }
    }
  }, true);
  
  // Intercept all link clicks for proper navigation
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && !link.href.startsWith(backendUrl)) {
      // Let the href rewrite handle it
    }
  }, true);
  
  // Handle postMessage from iframes
  window.addEventListener('message', function(e) {
    // Allow messages from the same origin
    if (e.origin === window.location.origin) {
      return;
    }
  });
  
  // Fix history API to work with proxy
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    if (url) {
      url = proxyUrl(url);
    }
    return originalPushState.call(this, state, title, url);
  };
  
  history.replaceState = function(state, title, url) {
    if (url) {
      url = proxyUrl(url);
    }
    return originalReplaceState.call(this, state, title, url);
  };
  
  console.log('🔒 ProxiBrowse: Enhanced proxy initialized with authentication support');
})();
</script>`

      let processedHtml = html
        .replace(/(<head[^>]*>)/i, '$1' + injectScript)
        .replace(
          /(href|src|action)=(["'])(.*?)\2/gi,
          (match, attr, quote, link) => {
            try {
              if (!link || link.startsWith("#") || link.startsWith("data:") || link.startsWith("javascript:")) {
                return match
              }
              const absolute = new URL(link, base).href
              return `${attr}=${quote}/proxy?url=${encodeURIComponent(absolute)}${quote}`
            } catch {
              return match
            }
          }
        )
        .replace(
          /url\((["']?)(.*?)\1\)/gi,
          (match, quote, url) => {
            try {
              if (!url || url.startsWith("data:") || url.startsWith("#")) {
                return match
              }
              const absolute = new URL(url, base).href
              return `url(${quote}/proxy?url=${encodeURIComponent(absolute)}${quote})`
            } catch {
              return match
            }
          }
        )

      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.setHeader("X-Cache", "MISS")
      return res.send(processedHtml)
    }

    // Handle other content types
    const buffer = Buffer.from(await response.arrayBuffer())

    // Cache static assets
    if (req.method === 'GET' && (contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('javascript'))) {
      setCachedResponse(target, buffer, contentType)
    }

    // Forward response headers (excluding security headers that block iframes)
    const forwardResponseHeaders = ['content-type', 'cache-control', 'expires', 'etag', 'last-modified', 'set-cookie']
    forwardResponseHeaders.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        if (header === 'set-cookie') {
          // Handle multiple Set-Cookie headers
          const cookies = response.headers.raw()['set-cookie']
          if (cookies && Array.isArray(cookies)) {
            res.setHeader('Set-Cookie', cookies)
          } else {
            res.setHeader('Set-Cookie', value)
          }
        } else {
          res.setHeader(header, value)
        }
      }
    })
    
    // Explicitly allow iframe embedding
    res.setHeader('X-Frame-Options', 'ALLOWALL')
    res.removeHeader('Content-Security-Policy')

    res.setHeader("X-Cache", "MISS")
    res.send(buffer)

  } catch (err) {
    console.error("Proxy request failed:", err.name, err.message)
    
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: "Request timeout" })
    }
    
    res.status(500).json({ 
      error: "Proxy request failed", 
      message: err.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err)
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 ProxiBrowse Backend v2.0.0 running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})