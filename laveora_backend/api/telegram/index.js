const https = require('https');
const { handleCors } = require('../../lib/cors');

async function sendToTelegram(message) {
  const body = JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.telegram.org', port: 443,
      path: `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => res.statusCode < 300 ? resolve(JSON.parse(data)) : reject(new Error(`${res.statusCode}`)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required.' });
    await sendToTelegram(message.replace(/<[^>]*>/g, '').slice(0, 1000));
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Telegram] error:', err.message);
    return res.status(502).json({ error: 'Failed to send notification.' });
  }
};
