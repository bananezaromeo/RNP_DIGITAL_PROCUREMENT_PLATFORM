// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer instance
const User = require('../models/User');


/**
 * @swagger
 * /api/auth/register-supplier:
 *   post:
 *     summary: Register a new supplier (individual or cooperative)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - supplierType
 *               - email
 *               - password
 *             properties:
 *               supplierType:
 *                 type: string
 *                 enum: [individual, cooperative]
 *                 description: Supplier type (individual or cooperative)
 *               fullName:
 *                 type: string
 *                 description: Full name (required if individual)
 *               cooperativeName:
 *                 type: string
 *                 description: Cooperative name (required if cooperative)
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               sector:
 *                 type: string
 *               national_id:
 *                 type: string
 *                 format: binary
 *                 description: National ID file
 *               business_license:
 *                 type: string
 *                 format: binary
 *                 description: Business license file
 *     responses:
 *       201:
 *         description: Registration successful, pending verification
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Server error
 */

// Supplier registration supports both individuals and cooperatives
router.post(
  '/register-supplier',
  upload.fields([
    { name: 'national_id', maxCount: 1 },
    { name: 'business_license', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { supplierType, fullName, cooperativeName, email, phone, password, province, district, sector } = req.body;

      if (!supplierType || !email || !password) {
        return res.status(400).json({ message: 'supplierType, email and password are required' });
      }
      if (supplierType === 'individual' && !fullName) {
        return res.status(400).json({ message: 'Full name is required for individual suppliers' });
      }
      if (supplierType === 'cooperative' && !cooperativeName) {
        return res.status(400).json({ message: 'Cooperative name is required for cooperatives' });
      }

      // check existing email
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: 'Email already registered' });

      // prepare upload paths
      const uploads = {};
      if (req.files && req.files['national_id'] && req.files['national_id'][0]) {
        uploads.national_id = `/uploads/national_id/${req.files['national_id'][0].filename}`;
      }
      if (req.files && req.files['business_license'] && req.files['business_license'][0]) {
        uploads.business_license = `/uploads/business_license/${req.files['business_license'][0].filename}`;
      }



      const user = new User({
        supplierType,
        fullName: supplierType === 'individual' ? fullName : undefined,
        cooperativeName: supplierType === 'cooperative' ? cooperativeName : undefined,
        email: email.toLowerCase(),
        phone: phone || '',
        province: province || '',
        district: district || '',
        sector: sector || '',
        role: 'supplier',
        uploads
      });

      // set virtual password to hash
      user.password = password;

      await user.save();

      return res.status(201).json({
        message: 'Registration received. Your account is pending verification by HQ.',
        userId: user._id
      });
    } catch (err) {
      console.error('register-supplier error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);


// POST /api/auth/login
// expects: { email, password }
const jwt = require('jsonwebtoken');
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Account not approved yet' });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
