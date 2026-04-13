const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ هنا هتحط بيانات OneSignal بتاعتك
const ONE_SIGNAL_APP_ID = "80e9a120-0f85-4238-add0-92fa66c3a40c";
const ONE_SIGNAL_REST_API_KEY = "os_v2_app_qdu2ciapqvbdrloqsl5gnq5ebte6en4ohtpu2sesnhns4677ivslc4zfwvf4udpwwpdsdsid4nfjji3pjs6qmuwp6xsuhevrn3w2i5i";

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.post("/send", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required" });
    }

    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONE_SIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: title, ar: title },
        contents: { en: message, ar: message }
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${ONE_SIGNAL_REST_API_KEY}`
        }
      }
    );

    return res.json({
      success: true,
      onesignal: response.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
