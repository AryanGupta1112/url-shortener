// ✅ API Base URL (Backend will handle security)
const API_BASE = "https://url-shortener-xfee.onrender.com/api";

console.log("🔑 API Key Removed from Frontend for Security");

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalUrl: longUrl, expiresIn: expiresIn || null })
        });

        const data = await response.json();

        if (data.shortUrl) {
            const shortCode = data.shortUrl.split("/").pop(); // Extract only the code
            const shortUrl = `${API_BASE.replace("/api", "")}/${shortCode}`; // Fix double base URL
            document.getElementById("shortUrl").value = shortUrl;
            resultDiv.classList.remove("hidden");

            // ✅ Display AI Category
            document.getElementById("urlCategory").innerText = data.category || "Uncategorized";

            // Fetch analytics immediately
            fetchAnalytics(shortCode);
        } else {
            throw new Error("Failed to shorten URL.");
        }
    } catch (error) {
        showError(`❌ Error: ${error.message}`);
    }
}

async function fetchAnalytics(shortCode) {
    try {
        const response = await fetch(`${API_BASE}/analytics/${shortCode}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (data.originalUrl) {
            document.getElementById("originalUrl").innerText = data.originalUrl;
            document.getElementById("clickCount").innerText = data.clicks;
            document.getElementById("analyticsResult").classList.remove("hidden");

            // ✅ Show Category in Analytics
            document.getElementById("analyticsCategory").innerText = data.category || "Uncategorized";
        }
    } catch (error) {
        console.error("❌ Error fetching analytics:", error);
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

// ✅ Dark Mode Toggle (Removed if default dark mode is enabled)
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}
