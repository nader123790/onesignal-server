// api/auth/cashier.js — POST /api/auth/cashier
const jwt = require('jsonwebtoken');
const { getDb } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const { password, role } = req.body;
    // role: 'cashier' | 'master'
    if (!password || !role) return res.status(400).json({ error: 'password and role are required.' });

    const docId = role === 'master' ? 'master_pass' : 'admin_pass';
    const db = getDb();
    const doc = await db.collection('settings').doc(docId).get();

    const correctPass = doc.exists ? doc.data().value : (role === 'master' ? 'LAVEORA_ADMIN' : '1234');

    const inputBuf = Buffer.from(password);
    const correctBuf = Buffer.from(correctPass);
    const match = inputBuf.length === correctBuf.length &&
      crypto.timingSafeEqual(inputBuf, correctBuf);

    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { role },
      process.env.JWT_SECRET,
      { expiresIn: '12h', issuer: 'laveora' }
    );

    return res.json({ token, role });
  } catch (err) {
    console.error('[Auth] cashier error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
