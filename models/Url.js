const mongoose = require("mongoose");
const shortid = require("shortid");

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, unique: true, default: shortid.generate },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null }, // ✅ Expiration Date Field
  category: { type: String, default: "Uncategorized" }, // Now using AI-based categorization

});

// ✅ Automatically delete expired URLs
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Ensure the model is correctly exported
const Url = mongoose.model("Url", urlSchema);
module.exports = Url;
