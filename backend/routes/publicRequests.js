const express = require('express');
const router = express.Router();
const PublicRequest = require('../models/PublicRequest'); // use the new PublicRequest model

/**
 * @swagger
 * tags:
 *   name: Public Requests
 *   description: API endpoints for public requests
 */

/**
 * @swagger
 * /api/public-requests:
 *   get:
 *     summary: Get all open public requests
 *     tags: [Public Requests]
 *     responses:
 *       200:
 *         description: List of public requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
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
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *     responses:
 *       201:
 *         description: Public request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
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
