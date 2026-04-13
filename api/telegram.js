import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Missing Telegram BOT_TOKEN or CHAT_ID" });
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: CHAT_ID,
      text: message
    });

    return res.status(200).json({ success: true, telegram: response.data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}
