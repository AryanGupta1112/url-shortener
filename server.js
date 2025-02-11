require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// ✅ Load API Key from Environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("❌ API Key is missing! Add it in the .env file.");
  process.exit(1);
}

// ✅ Allow Only Specific Frontend Domains
const allowedOrigins = [
  "https://url-shortener-nine-phi.vercel.app",
"https://url-shortener-xfee.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ Blocked request from disallowed origin: ${origin}`);
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"], // Remove x-api-key (handled internally)
    credentials: true, // Allow cookies if needed
  })
);

// ✅ Rate Limiting: Prevent API Abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow 100 requests per minute
  message: { error: "❌ Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// ✅ Serve Static Frontend Files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Check if MongoDB URI is Set
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MongoDB connection string is missing! Add it in the .env file.");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err));

// ✅ Secure API Key Middleware (No Need for Frontend to Send API Key)
app.use("/api/", (req, res, next) => {
  req.headers["x-api-key"] = API_KEY; // Inject API Key for internal use
  next();
});

// ✅ Import and Use API Routes
const urlRoutes = require("./routes/urlRoutes");
if (urlRoutes && Object.keys(urlRoutes).length > 0) {
  app.use("/api", urlRoutes);
} else {
  console.error("❌ Error: urlRoutes is empty or not a valid Express middleware function.");
}

// ✅ Redirect Handler for Shortened URLs
const Url = require("./models/Url");
app.get("/:shortUrl", async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });

    if (!url) {
      return res.status(404).json({ error: "❌ URL not found" });
    }

    // ✅ Check if link has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      await Url.deleteOne({ shortUrl: req.params.shortUrl });
      return res.status(410).json({ error: "❌ This short URL has expired and has been deleted." });
    }

    url.clicks++; // Increase click count
    await url.save();

    console.log(`🔄 Redirecting to: ${url.originalUrl}`); // Debugging Log
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("❌ Error in redirecting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Handle 404 Errors (API Routes)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "❌ API route not found" });
});

// ✅ Handle 404 Errors (Frontend)
app.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found" });
});

// ✅ Handle Internal Server Errors
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
