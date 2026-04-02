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

    const contentType = response.headers.get("content-type") || "text/plain";

    const buffer = Buffer.from(await response.arrayBuffer());

    res.status(200);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).send("Proxy failed: " + error.message);
  }
}