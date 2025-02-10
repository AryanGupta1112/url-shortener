require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// ✅ CORS: Allow only requests from frontend
const allowedOrigins = ["https://url-shortener-nine-phi.vercel.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "x-api-key"], // Allow specific headers
    credentials: true, // Allow credentials if needed
  })
);

// Rate Limiting: Max 5 requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { error: "❌ Too many requests. Please try again later." },
});
app.use("/api/", limiter); // Protect API routes

// Serve Static Files from public/
app.use(express.static(path.join(__dirname, "public")));

// Check if MongoDB URI is set
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MongoDB connection string is missing! Add it in .env file.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err));

// API Key Middleware (Extra Security)
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(403).json({ error: "❌ Unauthorized: Invalid API Key" });
  }
};
app.use("/api/", checkApiKey); // Apply API key security

// Import and Use API Routes
const urlRoutes = require("./routes/urlRoutes");

if (urlRoutes && Object.keys(urlRoutes).length > 0) {
  app.use("/api", urlRoutes);
} else {
  console.error("❌ Error: urlRoutes is empty or not a valid Express middleware function.");
}

// Serve the Main Frontend File (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//  Handle 404 Errors (for API routes)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

//  Handle 404 Errors (for frontend)
app.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found" });
});

// Handle Server Errors
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
