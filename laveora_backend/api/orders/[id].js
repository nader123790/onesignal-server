const { getDb, admin } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');
const { requireAuth } = require('../../lib/auth');

const VALID_STATUSES = ['قيد الانتظار', 'جاري التجهيز', 'جاهز'];

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed.' });
  if (!requireAuth(req, res)) return;
  try {
    const id = req.query.id;
    const { status } = req.body;
    if (!id) return res.status(400).json({ error: 'Order ID is required.' });
    if (!status || !VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Invalid status.` });
    const db = getDb();
    const ref = db.collection('orders').doc(id);
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'Order not found.' });
    await ref.update({ status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ id, status, message: 'Order updated.' });
  } catch (err) {
    console.error('[Orders] updateOrder error:', err);
    return res.status(500).json({ error: 'Failed to update order.' });
  }
};
