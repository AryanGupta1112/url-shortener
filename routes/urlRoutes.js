const express = require("express");
const Url = require("../models/Url");
const shortid = require("shortid");

const router = express.Router();

// ✅ Route to shorten a URL with optional expiration
router.post("/shorten", async (req, res) => {
  const { originalUrl, expiresIn } = req.body; // `expiresIn` is in days

  if (!originalUrl || typeof originalUrl !== "string") {
    return res.status(400).json({ error: "❌ Invalid or missing URL" });
  }

  try {
    const shortUrl = shortid.generate(); // Generate a unique short URL
    let expiresAt = null;

    // ✅ If expiration time is provided, calculate expiration date
    if (expiresIn && !isNaN(expiresIn)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn)); // Add days
    }

    const newUrl = new Url({ originalUrl, shortUrl, expiresAt });
    await newUrl.save();
    
    const baseUrl = process.env.BASE_URL || "https://url-shortener-xfee.onrender.com";


    res.status(201).json({
      message: "✅ URL shortened successfully!",
      originalUrl,
      shortUrl: newUrl.shortUrl,
      expiresAt: expiresAt ? expiresAt.toISOString() : "No expiration set",
    });
  } catch (error) {
    console.error("❌ Error in /shorten:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Route to redirect using short URL (check expiration)
router.get("/:shortUrl", async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });

    if (!url) {
      return res.status(404).json({ error: "❌ URL not found" });
    }

    // ✅ Check if link has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      // Delete expired link from database
      await Url.deleteOne({ shortUrl: req.params.shortUrl });
      return res.status(410).json({ error: "❌ This short URL has expired and has been deleted." });
    }

    url.clicks++; // Increase click count
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("❌ Error in redirecting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Route to track analytics
router.get("/analytics/:shortUrl", async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });

    if (!url) {
      return res.status(404).json({ error: "❌ URL not found" });
    }

    res.json({
      message: "📊 URL Analytics",
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt || "No expiration set",
    });
  } catch (error) {
    console.error("❌ Error in analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Handle undefined routes
router.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found in urlRoutes.js" });
});

// ✅ Ensure the router is properly exported
module.exports = router;
