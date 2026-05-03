const { getDb, admin } = require('../../lib/firebase');
const { handleCors } = require('../../lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { customer_name, table_number, items_with_qty, total, note, order_type, source } = req.body;
    if (!customer_name || !Array.isArray(items_with_qty) || items_with_qty.length === 0)
      return res.status(400).json({ error: 'customer_name and items_with_qty are required.' });

    const db = getDb();
    const docRef = await db.collection('orders').add({
      customer_name: String(customer_name).slice(0, 100),
      table_number: table_number ? String(table_number).slice(0, 20) : 'خارجي',
      items_with_qty: items_with_qty.map(i => ({ name: String(i.name || ''), qty: Math.max(1, parseInt(i.qty, 10) || 1) })),
      items: items_with_qty.map(i => String(i.name || '')),
      total: typeof total === 'number' ? parseFloat(total.toFixed(2)) : 0,
      total_price: typeof total === 'number' ? parseFloat(total.toFixed(2)) : 0,
      note: note ? String(note).slice(0, 500) : 'بدون إضافات',
      order_type: order_type ? String(order_type).slice(0, 50) : 'داخل المكان',
      source: source || 'customer',
      status: 'قيد الانتظار',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(201).json({ id: docRef.id, message: 'Order created.' });
  } catch (err) {
    console.error('[Orders] createOrder error:', err);
    return res.status(500).json({ error: 'Failed to create order.' });
  }
};
