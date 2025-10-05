// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer instance
const User = require('../models/User');

// POST /api/auth/register-supplier
// multipart/form-data expected with fields:
// fullName, companyName, email, phone, password
// files: national_id, business_license
router.post(
  '/register-supplier',
  upload.fields([
    { name: 'national_id', maxCount: 1 },
    { name: 'business_license', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { fullName, companyName, email, phone, password } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'fullName, email and password are required' });
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
        fullName,
        companyName: companyName || '',
        email: email.toLowerCase(),
        phone: phone || '',
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

module.exports = router;
