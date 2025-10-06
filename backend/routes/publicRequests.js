const express = require('express');
const router = express.Router();
const PublicRequest = require('../models/PublicRequest');

/**
 * @swagger
 * /api/public-requests:
 *   get:
 *     summary: Get all public requests
 *     tags: [Public Requests]
 *     responses:
 *       200:
 *         description: List of public requests
 */
router.get('/', async (req, res) => {
  try {
    const requests = await PublicRequest.find({ status: 'OPEN' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public requests' });
  }
});

/**
 * @swagger
 * /api/public-requests:
 *   post:
 *     summary: Create a new public request
 *     tags: [Public Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Public request created
 */
router.post('/', async (req, res) => {
  try {
    const request = new PublicRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

module.exports = router;
