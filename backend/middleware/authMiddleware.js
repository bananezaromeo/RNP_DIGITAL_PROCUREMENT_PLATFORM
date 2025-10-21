const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ HQ Only
exports.verifyHQ = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

// ✅ District Admin Only
exports.verifyDistrictAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'district')
      return res.status(403).json({ message: 'Access denied: District Admin only' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyDistrictAdmin error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Any Authenticated User
exports.verifyAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyAuth error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Region Admin Only
exports.verifyRegionAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'region')
      return res.status(403).json({ message: 'Access denied: Region Admin only' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyRegionAdmin error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Station Only
exports.verifyStation = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'station')
      return res.status(403).json({ message: 'Access denied: Station only' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyStation error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Special Unit Only
exports.verifySpecialUnit = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'specialUnit')
      return res.status(403).json({ message: 'Access denied: Special Unit only' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifySpecialUnit error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
