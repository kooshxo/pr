import express from "express"
import fetch from "node-fetch"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// proxy route
app.all("/proxy", async (req, res) => {

  try {

    const target = req.query.url

    if (!target) {
      return res.status(400).send("missing url")
    }

    const response = await fetch(target, {
      method: req.method,
      headers: {
        ...req.headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
        host: new URL(target).host // override host
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined
    })

    const contentType = response.headers.get("content-type") || ""

    // rewrite html
    if (contentType.includes("text/html")) {

      let html = await response.text()
      const base = new URL(target)

      // Inject script to proxy dynamic requests
      const injectScript = `
<script>
(function() {
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && !url.startsWith(window.location.origin) && !url.startsWith('/')) {
      url = window.location.origin + '/proxy?url=' + encodeURIComponent(url);
    } else if (typeof url === 'string' && url.startsWith('/')) {
      url = window.location.origin + '/proxy?url=' + encodeURIComponent(window.location.origin + url);
    }
    return originalFetch(url, options);
  };
  
  const originalXMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXMLHttpRequest();
    const originalOpen = xhr.open;
    xhr.open = function(method, url, ...args) {
      if (typeof url === 'string' && !url.startsWith(window.location.origin) && !url.startsWith('/')) {
        url = window.location.origin + '/proxy?url=' + encodeURIComponent(url);
      } else if (typeof url === 'string' && url.startsWith('/')) {
        url = window.location.origin + '/proxy?url=' + encodeURIComponent(window.location.origin + url);
      }
      return originalOpen.call(this, method, url, ...args);
    };
    return xhr;
  };
})();
</script>
`

      html = html.replace(/(<\/head>)/i, injectScript + '$1');

      html = html.replace(
        /(href|src|action)=["'](.*?)["']/gi,
        (match, attr, link) => {

          try {

            if (
              link.startsWith("#") ||
              link.startsWith("data:") ||
              link.startsWith("javascript:")
            ) return match

            const absolute = new URL(link, base).href

            return `${attr}="/proxy?url=${encodeURIComponent(absolute)}"`

          } catch {
            return match
          }

        }
      )

      res.setHeader("Content-Type", "text/html")
      res.send(html)
      return
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", contentType)

    res.send(buffer)

  } catch (err) {

    console.error(err)

    res.status(500).send("proxy error")

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})