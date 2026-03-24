const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

const CLIENT_ID = "	e0c0c18bbe2744e2f53285313179c390"; // paste your MAL Client ID here

app.use(cors());

// Route to fetch your entire anime list
app.get("/animelist", async (req, res) => {
  try {
    let url = "https://api.myanimelist.net/v2/users/Atharv2804/animelist?fields=title,genres,main_picture&limit=100";
    let allData = [];

    while (url) {
      const response = await fetch(url, {
        headers: {
          "X-MAL-CLIENT-ID": CLIENT_ID
        }
      });

      const data = await response.json();

      if (data.data) {
        allData = allData.concat(data.data);
      }

      // Move to next page if available
      url = data.paging?.next || null;
    }

    res.json({ data: allData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
