const jwt = require('jsonwebtoken');
function requireAuth(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required.' });
    return false;
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'laveora' });
    return true;
  } catch (err) {
    res.status(401).json({ error: err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.' });
    return false;
  }
}
module.exports = { requireAuth };
