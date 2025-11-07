const express = require('express');
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  aggregateRequests
} = require('../controllers/requestController');

const { 
  verifyAuth,
  verifyStation,
  verifySpecialUnit,
  verifyDistrictAdmin,
  verifyRegionAdmin,
  verifyHQ
} = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * ✅ Create Request
 * Allowed: Station + Special Unit
 */
router.post('/', verifyAuth, (req, res, next) => {
  if (req.user.role !== 'station' && req.user.role !== 'specialUnit') {
    return res.status(403).json({ message: 'Access denied: Only stations or special units can create requests' });
  }
  next();
}, createRequest);

/**
 * ✅ Get Requests (Dashboard)
 * Allowed: Any authenticated user
 */
router.get('/', verifyAuth, getRequests);

/**
 * ✅ Aggregate Requests (District → Region → HQ)
 * Allowed: District Admin only
 */
router.post('/aggregate', verifyDistrictAdmin, aggregateRequests);

/**
 * ✅ Get Single Request
 */
router.get('/:id', verifyAuth, getRequestById);

/**
 * ✅ Update Request (status, remarks, quantities)
 */
router.patch('/:id', verifyAuth, updateRequest);

/**
 * ✅ Delete Request
 */
router.delete('/:id', verifyAuth, deleteRequest);

module.exports = router;
