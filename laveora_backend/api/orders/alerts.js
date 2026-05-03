const { getDb, admin } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { customer_name, table_number } = req.body;
    if (!customer_name || !table_number)
      return res.status(400).json({ error: 'customer_name and table_number are required.' });
    const db = getDb();
    const docRef = await db.collection('alerts').add({
      customer_name: String(customer_name).slice(0, 100),
      table_number: String(table_number).slice(0, 20),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('[Alerts] error:', err);
    return res.status(500).json({ error: 'Failed to create alert.' });
  }
};
