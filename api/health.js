const { handleCors } = require('../lib/cors');
module.exports = (req, res) => {
  if (handleCors(req, res)) return;
  res.json({ status: 'ok', service: 'laveora-backend' });
};
