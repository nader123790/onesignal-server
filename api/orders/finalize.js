// api/orders/finalize.js — POST /api/orders/finalize
// Moves orders to sales collection and deletes them — replaces client-side _finalizeOrder
const { getDb, admin } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!requireAuth(req, res)) return;

  try {
    const { order_ids } = req.body;
    if (!Array.isArray(order_ids) || order_ids.length === 0)
      return res.status(400).json({ error: 'order_ids must be a non-empty array.' });

    const db = getDb();
    const batch = db.batch();

    for (const id of order_ids) {
      const ref = db.collection('orders').doc(id);
      const doc = await ref.get();
      if (!doc.exists) continue;

      const data = doc.data();
      const saleRef = db.collection('sales').doc();
      batch.set(saleRef, {
        customer_name: data.customer_name ?? 'غير محدد',
        table_number: data.table_number ?? 'غير محدد',
        items: data.items ?? [],
        items_with_qty: data.items_with_qty ?? [],
        total: data.total ?? 0,
        note: data.note ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        timestamp: data.timestamp ?? admin.firestore.FieldValue.serverTimestamp(),
        finalized_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.delete(ref);
    }

    await batch.commit();
    return res.json({ message: `${order_ids.length} order(s) finalized.` });
  } catch (err) {
    console.error('[Orders] finalizeOrder error:', err);
    return res.status(500).json({ error: 'Failed to finalize orders.' });
  }
};
