const jwt = require('jsonwebtoken');
const { getDb } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'password is required.' });

    const db = getDb();
    const doc = await db.collection('settings').doc('waiter_pass').get();
    const correctPass = doc.exists ? doc.data().value : '1234';

    const match = Buffer.from(password).length === Buffer.from(correctPass).length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(correctPass));

    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ role: 'waiter' }, process.env.JWT_SECRET, { expiresIn: '12h', issuer: 'laveora' });
    return res.json({ token });
  } catch (err) {
    console.error('[Auth] waiter error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
