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

    const fetchHeaders = {
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
      "Host": new URL(target).host
    }

    const response = await fetch(target, {
      method: req.method,
      headers: fetchHeaders,
      redirect: 'manual',
      compress: true
    })

    const contentType = response.headers.get("content-type") || ""

    // if target response is a redirect, convert location to proxy-wrapped location
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (location) {
        const redirectUrl = new URL(location, target).href
        res.setHeader("Location", `/proxy?url=${encodeURIComponent(redirectUrl)}`)
      }
      return res.status(response.status).send(``)  // no body needed for redirects
    }

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

    console.error("Proxy request failed:", err)
    res.status(500).send(`proxy error: ${err.message}`)

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})