const API_BASE = "https://url-shortener-xfee.onrender.com/api"; // Change when deploying

async function shortenUrl() {
    const longUrl = document.getElementById("longUrl").value.trim();
    const expiresIn = document.getElementById("expiresIn").value.trim();
    const resultDiv = document.getElementById("result");
    const errorMessage = document.getElementById("errorMessage");

    // Reset Ui
    resultDiv.classList.add("hidden");
    errorMessage.classList.add("hidden");

    if (!longUrl) {
        showError("❌ Please enter a valid URL!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/shorten`, {
            method: "POST",
            headers: { "Content-Type": "application/json",
      "x-api-key": "3ec2b6975d147d081810dbe2ee1aede6c329f7bf59e7dd775f62c8ef88e08355", },
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
              "x-api-key": "3ec2b6975d147d081810dbe2ee1aede6c329f7bf59e7dd775f62c8ef88e08355", // Add your actual API key
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
(async () => {
    try {
      const shortUrlData = await shortenUrl("https://google.com");
      console.log("Shortened URL:", shortUrlData.shortUrl);
  
      const analyticsData = await getAnalytics(shortUrlData.shortUrl);
      console.log("Analytics:", analyticsData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  })();

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
