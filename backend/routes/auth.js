const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyHQ } = require('../middleware/authMiddleware');

/**
 * ========================
 * EMAIL CONFIGURATION
 * ========================
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // dpamisapp@gmail.com
    pass: process.env.SMTP_PASS  // app password
  }
});

/**
 * ========================
 * SWAGGER TAGS
 * ========================
 */
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Supplier and Admin account management
 *   - name: ProcurementHQ
 *     description: Account approval and management by Procurement HQ
 */

/**
 * ========================
 * SUPPLIER REGISTRATION
 * ========================
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - supplierType
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               supplierType: { type: string, enum: [individual, cooperative] }
 *               cooperativeName: { type: string }
 *     responses:
 *       201: { description: Supplier registered successfully. Awaiting approval. }
 *       400: { description: Validation or duplication error }
 */
router.post('/register-supplier', async (req, res) => {
  try {
    const { fullName, email, phone, password, supplierType, cooperativeName } = req.body;
    if (!fullName || !email || !password || !supplierType) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({ fullName, email, phone, supplierType, cooperativeName, role: 'supplier' });
    user.password = password;
    await user.save();

    return res.status(201).json({ message: 'Supplier registered successfully. Awaiting approval.' });
  } catch (error) {
    console.error('register-supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ========================
 * ADMIN REGISTRATION (District, Region, HQ)
 * ========================
 */
/**
 * @swagger
 * /api/auth/register-admin:
 *   post:
 *     summary: Register a new admin (District, Region, or HQ)
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
 *               fullName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [district, region, hq] }
 *               province: { type: string }
 *               district: { type: string }
 *     responses:
 *       201: { description: Admin registered successfully. Awaiting approval or auto-approved for HQ. }
 *       400: { description: Validation or duplication error }
 */
router.post('/register-admin', async (req, res) => {
  try {
    const { fullName, email, phone, password, role, province, district } = req.body;
    if (!fullName || !email || !password || !role) return res.status(400).json({ message: 'Missing required fields' });
    if (!['district', 'region', 'hq'].includes(role)) return res.status(400).json({ message: 'Invalid admin role' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({ fullName, email, phone, role, province, district, status: role === 'hq' ? 'approved' : 'pending' });
    user.password = password;
    await user.save();

    return res.status(201).json({
      message: role === 'hq' ? 'HQ Admin registered successfully and approved automatically.' : `${role} Admin registered successfully. Awaiting approval.`
    });
  } catch (error) {
    console.error('register-admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ========================
 * LOGIN
 * ========================
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for any user (supplier or admin)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 *       403: { description: Account not approved yet }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.status !== 'approved') return res.status(403).json({ message: 'Account not approved yet' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });

    return res.json({ message: 'Login successful', token, role: user.role, email: user.email });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ========================
 * PROCUREMENT HQ MANAGEMENT
 * ========================
 */
/**
 * @swagger
 * /api/admin/pending-approvals:
 *   get:
 *     summary: Get all pending users (Suppliers + Admins)
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of pending users }
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
 * /api/admin/approve-user/{id}:
 *   post:
 *     summary: Approve user and send OTP + magic link
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User approved and OTP + link sent via email }
 *       400: { description: User already processed }
 *       404: { description: User not found }
 */
router.post('/admin/approve-user/:id', verifyHQ, async (req, res) => {
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
      html: `
        <p>Hello ${user.fullName || 'User'},</p>
        <p>Your account has been approved. Activate using:</p>
        <ol>
          <li>OTP: <b>${otp}</b> (expires in 10 min)</li>
          <li>Or click this activation link: <a href="${activationLink}">Activate Account</a></li>
        </ol>
      `
    });

    res.json({ message: 'User approved and OTP + activation link sent via email.' });
  } catch (err) {
    console.error('approve-user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/admin/reject-user/{id}:
 *   post:
 *     summary: Reject a user registration
 *     tags: [ProcurementHQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User rejected successfully }
 *       404: { description: User not found }
 */
router.post('/admin/reject-user/:id', verifyHQ, async (req, res) => {
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
 *     summary: Confirm OTP manually to activate account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200: { description: OTP confirmed. Account activated }
 *       400: { description: OTP invalid or expired }
 *       404: { description: User not found }
 */
router.post('/confirm-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

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
 *   get:
 *     summary: Magic link activation
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: otp
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirects to login with activated=true }
 *       400: { description: Invalid link or OTP expired }
 *       404: { description: User not found }
 */
router.get('/activate', async (req, res) => {
  try {
    const { email, otp } = req.query;
    if (!email || !otp) return res.status(400).send('Invalid activation link.');

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

module.exports = router;
