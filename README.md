# 🔗 URL Shortener
A web-based **URL Shortener** that allows users to generate **short links** with **click tracking** and **expiration dates**.

## 🚀 Features
✅ Shorten long URLs  
✅ Set **expiration dates** for short links  
✅ Track **click analytics**
✅ Simple **dark mode UI**  
✅ **MongoDB Atlas** for database storage
✅ **API Key Authentication** for secure access 🔑  

## 📜 How to Use
1. Enter a long URL.  
2. (Optional) Set an expiration time.  
3. Click **Shorten URL**.  
4. Copy and share your short URL!  

## 📜 How to Use the API (Requires API Key 🔐)
The API now requires an **API Key** for all requests.
To use the API, **request an API key and the API** by contacting the developer. Here’s how to use it:

### **1️⃣ Shorten a URL**
```sh
curl -X POST "https://yourapp.onrender.com/api/shorten" \
-H "Content-Type: application/json" \
-H "x-api-key: your-secret-api-key-here" \
-d "{\"originalUrl\": \"https://google.com\"}"
```
✅ Expected Response:
```json
{
  "message": "✅ URL shortened successfully!",
  "originalUrl": "https://google.com",
  "shortUrl": "abc123"
}
```

## 2️⃣ **Retrieve Analytics for a Shortened URL**
```sh
curl -X GET "https://yourapp.onrender.com/api/analytics/abc123" \
-H "x-api-key: your-secret-api-key-here"
```
✅ Expected Response:
```json
{
  "message": "📊 URL Analytics",
  "originalUrl": "https://google.com",
  "shortUrl": "abc123",
  "clicks": 5,
  "createdAt": "2025-02-08T17:38:13.608Z",
  "expiresAt": "No expiration set"
}
```

## 🔐 Security Enhancements
API Key Authentication: Prevents unauthorized API access.
CORS Protection: Allows only requests from the frontend.
Rate Limiting: Limits requests to 5 per minute to prevent abuse.

## 🔧 Tech Stack
Frontend: HTML, CSS (TailwindCSS), JavaScript
Backend: Node.js, Express.js
Database: MongoDB Atlas
Hosting: Render (backend) & Vercel (frontend)

## 🚀 How to Run Locally
```sh
# Clone the repository
git clone https://github.com/AryanGupta1112/url-shortener.git

# Navigate to the folder
cd url-shortener

# Install dependencies
npm install

# Create a `.env` file and add:
API_KEY=your-secret-api-key-here
MONGO_URI=your-mongodb-uri-here

# Start the server
node server.js
```

## 📡 Deployment
Frontend: Live on Vercel
Backend API: Live on Render

## 🤝 Contributing
Feel free to contribute! Fork the repo, create a branch, and submit a PR.

## 📸 Screenshot
Here’s a preview of the URL Shortener:

![UI screenshot](https://github.com/user-attachments/assets/91198cd7-1bf6-4446-b3d1-09ed40bbfabc) 