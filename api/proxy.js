// Vercel serverless API route for proxy
import fetch from 'node-fetch';
import { URL } from 'url';

// Trust proxy for rate limiting equivalent
export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(url);
    new URL(targetUrl); // validate
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Block private IPs
  const hostname = new URL(targetUrl).hostname;
  if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('10.') || 
      hostname.startsWith('192.168.') || hostname.startsWith('172.16.')) {
    return res.status(403).json({ error: 'Access to private networks is not allowed' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    // Forward headers
    const forwardHeaders = ['content-type', 'cache-control', 'expires', 'etag', 'last-modified'];
    forwardHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    // Allow iframe
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    
    // Handle cookies
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Rewrite URLs in HTML
      const targetOrigin = new URL(targetUrl).origin;
      html = html.replace(
        /(href|src|action)=['"](\/[^'"]*)['"]/gi,
        `$1="/api/proxy?url=${encodeURIComponent(targetOrigin + '$2')}"`
      );
      html = html.replace(
        /(href|src|action)=['"](https?:\/\/[^'"]*)['"]/gi,
        `$1="/api/proxy?url=${encodeURIComponent('$2')}"`
      );
      
      // Inject proxy script
      const proxyScript = `
        <script>
          (function() {
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              if (typeof url === 'string' && !url.startsWith('/api/')) {
                url = '/api/proxy?url=' + encodeURIComponent(url);
              }
              return originalFetch(url, options);
            };
            
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
              if (typeof url === 'string' && !url.startsWith('/api/')) {
                url = '/api/proxy?url=' + encodeURIComponent(url);
              }
              return originalOpen.call(this, method, url, ...args);
            };
          })();
        </script>
      `;
      html = html.replace('</head>', proxyScript + '</head>');
      
      res.status(response.status).send(html);
    } else {
      // Stream binary content
      const buffer = await response.buffer();
      res.status(response.status).send(buffer);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', message: error.message });
  }
}
