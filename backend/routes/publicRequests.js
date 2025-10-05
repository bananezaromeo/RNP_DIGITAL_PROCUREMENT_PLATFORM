const express = require('express');
const router = express.Router();
const PublicRequest = require('../models/PublicRequest');

// GET all OPEN requests (for landing page)
router.get('/', async (req, res) => {
  try {
    const requests = await PublicRequest.find({ status: 'OPEN' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public requests' });
  }
});

// (Optional) POST new request — used only by procurement team later
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
