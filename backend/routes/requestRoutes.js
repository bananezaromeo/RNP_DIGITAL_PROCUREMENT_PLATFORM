const express = require("express");
const {
  verifyAuth,
  verifyDistrictAdmin,
  verifyHQ,
} = require("../middleware/authMiddleware");

const {
  createRequest,
  getRequests,
  getDistrictAggregatedRequests,
  approveDistrictRequests,
  getHQAggregatedRequests,
  approveHQRequest,
} = require("../controllers/requestController");

const router = express.Router();

// Create request (station, special unit, district, region)
router.post("/create", verifyAuth, createRequest);

// Get own requests
router.get("/my-requests", verifyAuth, getRequests);

// District Admin: aggregated requests from stations/special units
router.get("/district/aggregated", verifyDistrictAdmin, getDistrictAggregatedRequests);

// District Admin: approve selected requests and send aggregation to HQ
router.post("/district/approve", verifyDistrictAdmin, approveDistrictRequests);

// HQ: view all aggregated requests
router.get("/hq/aggregated", verifyHQ, getHQAggregatedRequests);

// HQ: approve request
router.patch("/hq/approve/:id", verifyHQ, approveHQRequest);

module.exports = router;
