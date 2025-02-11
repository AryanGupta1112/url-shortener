const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const natural = require("natural");
const Url = require("../models/Url");
const shortid = require("shortid");

const router = express.Router();

// ✅ Initialize Naive Bayes Classifier
const classifier = new natural.BayesClassifier();

// ✅ Train the Model with Sample Data (TF-IDF Based)
const trainingData = [
  { text: "latest news headlines politics sports", category: "News" },
  { text: "best online shopping deals ecommerce store", category: "Shopping" },
  { text: "university courses learning education study materials", category: "Education" },
  { text: "movies streaming music online watch entertainment", category: "Entertainment" },
  { text: "social networking site instagram facebook twitter", category: "Social Media" },
  { text: "programming tech AI software coding", category: "Technology" },
  { text: "health medicine fitness doctor hospital", category: "Health" }
];

// ✅ Add training data to classifier
trainingData.forEach((data) => {
  classifier.addDocument(data.text, data.category);
});
classifier.train();

// ✅ Function to Categorize a URL Using TF-IDF
async function categorizeUrl(url) {
  try {
    // Fetch webpage content
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    // Extract title & meta description
    const pageTitle = $("title").text() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const textContent = pageTitle + " " + metaDescription;

    // ✅ Use ML Model to Predict Category
    const predictedCategory = classifier.classify(textContent);
    return predictedCategory || "Uncategorized";
  } catch (error) {
    console.error("❌ Error fetching URL content:", error.message);
    return "Uncategorized";
  }
}

// ✅ Route to shorten a URL with optional expiration and AI categorization
router.post("/shorten", async (req, res) => {
  const { originalUrl, expiresIn } = req.body;

  if (!originalUrl || typeof originalUrl !== "string") {
    return res.status(400).json({ error: "❌ Invalid or missing URL" });
  }

  try {
    const shortUrl = shortid.generate();
    let expiresAt = null;

    if (expiresIn && !isNaN(expiresIn)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    // ✅ Categorize URL Using TF-IDF & ML
    const category = await categorizeUrl(originalUrl);

    const newUrl = new Url({ originalUrl, shortUrl, expiresAt, category });
    await newUrl.save();

    const baseUrl = process.env.BASE_URL || "https://url-shortener-xfee.onrender.com";

    res.status(201).json({
      message: "✅ URL shortened successfully!",
      originalUrl,
      shortUrl: shortUrl,
      category, // Now using TF-IDF for categorization
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

// ✅ Route to track analytics (including AI-predicted category)
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
      category: url.category || "Uncategorized",
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt ? url.expiresAt.toISOString() : "No expiration set",
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
