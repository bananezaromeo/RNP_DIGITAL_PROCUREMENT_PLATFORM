// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyHQ = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIXED: Use decoded.id (not decoded.userId)
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'hq')
      return res.status(403).json({ message: 'Access denied: HQ only' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyHQ error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
