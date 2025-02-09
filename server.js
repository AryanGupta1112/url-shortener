require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Serve Static Files from `public/`
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


// ✅ Import and Use API Routes
const urlRoutes = require("./routes/urlRoutes");

// ✅ Check if urlRoutes is a valid Express Router
if (urlRoutes && Object.keys(urlRoutes).length > 0) {
  app.use("/api", urlRoutes);
} else {
  console.error("❌ Error: urlRoutes is empty or not a valid Express middleware function.");
}

// ✅ Serve the Main Frontend File (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404 Errors (for API routes)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Handle 404 Errors (for frontend)
app.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found" });
});


// Handle Server Errors
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

