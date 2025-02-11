// ✅ Load API Base URL and API Key from Environment Variables
const API_BASE = "https://url-shortener-xfee.onrender.com/api"; // Change when deploying
const API_KEY = process.env.API_KEY; // Load API key securely
console.log("🔑 API Key Loaded:", API_KEY);

async function shortenUrl() {
    const longUrl = document.getElementById("longUrl").value.trim();
    const expiresIn = document.getElementById("expiresIn").value.trim();
    const resultDiv = document.getElementById("result");
    const errorMessage = document.getElementById("errorMessage");

    // Reset UI
    resultDiv.classList.add("hidden");
    errorMessage.classList.add("hidden");

    if (!longUrl) {
        showError("❌ Please enter a valid URL!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/shorten`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY, // ✅ Use environment variable for API key
            },
            body: JSON.stringify({ originalUrl: longUrl, expiresIn: expiresIn || null })
        });

        const data = await response.json();

        if (data.shortUrl) {
            const shortUrl = `${API_BASE}/${data.shortUrl}`;
            document.getElementById("shortUrl").value = shortUrl;
            resultDiv.classList.remove("hidden");

            // Fetch analytics immediately
            fetchAnalytics(data.shortUrl);
        } else {
            throw new Error("Failed to shorten URL.");
        }
    } catch (error) {
        showError(`❌ Error: ${error.message}`);
    }
}

async function fetchAnalytics(shortUrl) {
    try {
        const response = await fetch(`${API_BASE}/analytics/${shortUrl}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY, // ✅ Use environment variable for API key
            },
        });

        const data = await response.json();

        if (data.originalUrl) {
            document.getElementById("originalUrl").innerText = data.originalUrl;
            document.getElementById("clickCount").innerText = data.clicks;
            document.getElementById("analyticsResult").classList.remove("hidden");
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
    }
}

function copyUrl() {
    const shortUrlInput = document.getElementById("shortUrl");
    shortUrlInput.select();
    document.execCommand("copy");
    alert("✅ Copied to clipboard: " + shortUrlInput.value);
}

function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.innerText = message;
    errorMessage.classList.remove("hidden");
}

// ✅ Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}
