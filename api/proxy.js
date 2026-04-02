export default async function handler(req, res) {

  try {

    const target = req.query.url;

    if (!target) {
      res.status(400).send("Missing url parameter");
      return;
    }

    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = response.headers.get("content-type") || "";

    // Handle HTML
    if (contentType.includes("text/html")) {

      let html = await response.text();
      const base = new URL(target);

      html = html.replace(
        /(href|src|action)=["'](.*?)["']/gi,
        (match, attr, link) => {

          try {

            if (
              link.startsWith("#") ||
              link.startsWith("data:") ||
              link.startsWith("javascript:")
            ) return match;

            const absolute = new URL(link, base).href;

            return `${attr}="/api/proxy?url=${encodeURIComponent(absolute)}"`;

          } catch {
            return match;
          }

        }
      );

      res.setHeader("Content-Type", "text/html");
      res.send(html);
      return;

    }

    // Handle assets
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.send(buffer);

  } catch (err) {

    console.error(err);
    res.status(500).send("Proxy error");

  }

}