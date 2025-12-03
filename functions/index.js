const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const fetch = require("node-fetch"); // v2 kell!

setGlobalOptions({ maxInstances: 10 });

exports.photonSearch = onRequest(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  const q = req.query.q;
  if (!q) {
    res.set("Access-Control-Allow-Origin", "*");
    return res.status(400).json({ error: "Missing query parameter q" });
  }

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Photon error:", response.status, text);
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(response.status).json({ error: "Photon failed", details: text });
    }

    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.set("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Failed to fetch from Photon" });
  }
});