const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const upload = require('../middleware/upload'); // multer instance
const { verifyHQ, verifyDistrictAdmin } = require('../middleware/authMiddleware');

/**
 * ========================
 * EMAIL CONFIGURATION
 * ========================
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Supplier and Admin account management
 *   - name: ProcurementHQ
 *     description: Account approval and management by Procurement HQ
 *   - name: DistrictAdmin
 *     description: Management of stations and special units by District admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         role:
 *           type: string
 *         email:
 *           type: string
 *
 *     SupplierRegisterRequest:
 *       type: object
 *       required:
 *         - supplierType
 *         - email
 *         - password
 *       properties:
 *         supplierType:
 *           type: string
 *           enum: [individual, cooperative]
 *         fullName:
 *           type: string
 *         cooperativeName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *         province:
 *           type: string
 *         district:
 *           type: string
 *         sector:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register-supplier:
 *   post:
 *     summary: Register a new supplier (individual or cooperative)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SupplierRegisterRequest'
 *           encoding:
 *             national_id:
 *               contentType: image/png, image/jpeg, application/pdf
 *             business_license:
 *               contentType: image/png, image/jpeg, application/pdf
 *     responses:
 *       201:
 *         description: Supplier created successfully (awaiting approval)
 *       400:
 *         description: Invalid or duplicate data
 *       500:
 *         description: Server error
 */

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
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (supplierType === 'individual' && !fullName) {
        return res.status(400).json({ message: 'Full name is required for individual suppliers' });
      }
      if (supplierType === 'cooperative' && !cooperativeName) {
        return res.status(400).json({ message: 'Cooperative name is required for cooperatives' });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Email already exists' });

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
        status: 'pending',
        uploads
      });
      user.password = password;

      await user.save();
      return res.status(201).json({ message: 'Supplier registered successfully. Awaiting approval.' });
    } catch (err) {
      console.error('register-supplier error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);


/**
 * @swagger
 * /api/auth/register-admin:
 *   post:
 *     summary: Register a new admin (District / Region / HQ)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [district, region, hq]
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered (HQ auto-approved, others pending)
 *       400:
 *         description: Missing required fields or duplicate email
 *       500:
 *         description: Server error
 */

router.post('/register-admin', async (req, res) => {
  try {
    const { fullName, email, phone, password, role, province, district } = req.body;
    if (!fullName || !email || !password || !role) return res.status(400).json({ message: 'Missing required fields' });
    if (!['district', 'region', 'hq'].includes(role)) return res.status(400).json({ message: 'Invalid admin role' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({
      fullName,
      email,
      phone,
      role,
      province,
      district,
      status: role === 'hq' ? 'approved' : 'pending'
    });
    user.password = password;

    await user.save();
    return res.status(201).json({ message: role === 'hq' ? 'HQ Admin registered successfully and approved automatically.' : `${role} Admin registered successfully. Awaiting approval.` });
  } catch (error) {
    console.error('register-admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login using email & password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success + JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not yet approved
 *       500:
 *         description: Server error
 */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.comparePassword(password)) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Account not approved yet' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    return res.json({ message: 'Login successful', token, role: user.role, email: user.email });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/admin/pending-approvals:
 *   get:
 *     summary: Get all pending user accounts awaiting approval
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending users
 *       403:
 *         description: Only Procurement HQ can access
 *       500:
 *         description: Server error
 */

router.get('/admin/pending-approvals', verifyHQ, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('fullName email role supplierType province district createdAt');
    res.json({ count: pendingUsers.length, pendingUsers });
  } catch (err) {
    console.error('pending-approvals error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/admin/approve-user/{id}:
 *   patch:
 *     summary: Approve a user and send OTP + activation email
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to approve
 *     responses:
 *       200:
 *         description: Account approved, OTP sent
 *       404:
 *         description: User not found
 *       400:
 *         description: Already processed
 *       500:
 *         description: Server error
 */

router.patch('/admin/approve-user/:id', verifyHQ, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status !== 'pending') return res.status(400).json({ message: 'User already processed' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.status = 'approved';
    await user.save();

    const activationLink = `${process.env.APP_URL}/activate?email=${encodeURIComponent(user.email)}&otp=${otp}`;
    await transporter.sendMail({
      from: `"RNP DPAMIS" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Account Approved – Verify OTP or Click Link',
      html: `<p>Hello ${user.fullName || 'User'},</p>
             <p>Your account has been approved. Activate using:</p>
             <ol>
               <li>OTP: <b>${otp}</b> (expires in 10 min)</li>
               <li>Or click this activation link: <a href="${activationLink}">Activate Account</a></li>
             </ol>`
    });

    res.json({ message: 'User approved and OTP + activation link sent via email.' });
  } catch (err) {
    console.error('approve-user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/admin/reject-user/{id}:
 *   patch:
 *     summary: Reject user registration request
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User rejected
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.patch('/admin/reject-user/:id', verifyHQ, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'rejected';
    await user.save();

    await transporter.sendMail({
      from: `"RNP DPAMIS" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Account Application Rejected',
      text: `Hello ${user.fullName || 'User'},\n\nYour registration has been rejected by Procurement HQ.`
    });

    res.json({ message: 'User rejected successfully.' });
  } catch (err) {
    console.error('reject-user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/confirm-otp:
 *   post:
 *     summary: Confirm OTP sent to user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.post('/confirm-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired or not generated' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.status = 'approved';
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: 'OTP confirmed. Account activated.' });
  } catch (err) {
    console.error('confirm-otp error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/activate:
 *   post:
 *     summary: Activate user account after OTP confirmation
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account activated successfully
 *       400:
 *         description: Account already active or pending
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/activate', async (req, res) => {
  try {
    const { email, otp } = req.query;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send('User not found.');
    if (!user.otp || user.otpExpires < Date.now()) return res.status(400).send('OTP expired.');
    if (user.otp !== otp) return res.status(400).send('Invalid OTP.');

    user.status = 'approved';
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.redirect(`${process.env.APP_URL}/login?activated=true`);
  } catch (err) {
    console.error('activate error:', err);
    return res.status(500).send('Server error.');
  }
});

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user (in case they didn’t receive first one)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status === 'approved') return res.status(400).json({ message: 'Account already verified' });

    const now = Date.now();
    const otpExpired = !user.otpExpires || user.otpExpires < now;
    const otpMissing = !user.otp;

    if (user.resendCount >= 3 && user.lastResend && now - user.lastResend < 60 * 60 * 1000) {
      return res.status(429).json({ message: 'Too many OTP resends. Try again in an hour.' });
    }
    if (user.lastResend && now - user.lastResend < 2 * 60 * 1000) {
      const secondsLeft = Math.ceil((2 * 60 * 1000 - (now - user.lastResend)) / 1000);
      return res.status(429).json({ message: `Please wait ${secondsLeft}s before requesting again.` });
    }

    if (otpExpired || otpMissing) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = newOtp;
      user.otpExpires = now + 10 * 60 * 1000;
      user.lastResend = now;
      user.resendCount = (user.resendCount || 0) + 1;
      await user.save();

      console.log(`📩 OTP resent to ${email}: ${newOtp}`);
      return res.status(200).json({ message: 'A new OTP has been sent to your email (or check console for testing).' });
    }
    return res.status(400).json({ message: 'Your current OTP is still valid. Please check your email.' });
  } catch (error) {
    console.error('resend-otp error:', error);
    res.status(500).json({ message: 'Internal server error while resending OTP' });
  }
});

/**
 * @swagger
 * /api/auth/district/create-station:
 *   post:
 *     summary: Create a new Station Admin under District
 *     tags: [DistrictAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Station Admin created (pending approval)
 *       403:
 *         description: Only District Admin can access
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */

router.post('/district/create-station', verifyDistrictAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, password, stationName } = req.body;
    if (!fullName || !email || !password || !stationName) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const station = new User({
      fullName,
      email,
      phone,
      stationName,
      role: 'station',
      province: req.user.province,
      district: req.user.district,
      parentDistrictId: req.user.id,
      status: 'pending'
    });
    station.password = password;
    await station.save();

    res.status(201).json({ message: 'Station account created successfully. Pending HQ approval.' });
  } catch (err) {
    console.error('create-station error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/district/create-special-unit:
 *   post:
 *     summary: Create a new Special Unit Admin under District
 *     tags: [DistrictAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Special Unit Admin created (pending approval)
 *       403:
 *         description: Only District Admin can access
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */

router.post('/district/create-special-unit', verifyDistrictAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, password, unitName } = req.body;
    if (!fullName || !email || !password || !unitName) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const specialUnit = new User({
      fullName,
      email,
      phone,
      unitName,
      role: 'specialUnit',
      province: req.user.province,
      district: req.user.district,
      parentDistrictId: req.user.id,
      status: 'pending'
    });
    specialUnit.password = password;
    await specialUnit.save();

    res.status(201).json({ message: 'Special Unit account created successfully. Pending HQ approval.' });
  } catch (err) {
    console.error('create-special-unit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
