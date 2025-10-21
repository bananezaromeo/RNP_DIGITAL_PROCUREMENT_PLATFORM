const Request = require("../models/Request");
const Product = require("../models/Product");
const User = require("../models/User");

// Create request (Station / Special Unit / District / Region)
const createRequest = async (req, res) => {
  try {
    const { product, quantity, remarks } = req.body;

    const foundProduct = await Product.findById(product);
    if (!foundProduct) return res.status(404).json({ message: "Product not found" });

    const newRequest = new Request({
      product,
      quantity,
      unit: foundProduct.unit,
      createdBy: req.user._id,
      level: req.user.role,
      parentId:
        req.user.role === "station" || req.user.role === "specialUnit"
          ? req.user.parentDistrictId
          : req.user.role === "district"
          ? req.user.parentRegionId || null
          : null,
      remarks,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully", newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

// Get requests by current user
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ createdBy: req.user._id })
      .populate("product", "name unit")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// District Admin: view aggregated requests from stations/special units
const getDistrictAggregatedRequests = async (req, res) => {
  try {
    const districtId = req.user._id;
    const requests = await Request.find({
      parentId: districtId,
      level: { $in: ["station", "specialUnit"] },
      status: "pending",
    }).populate("product", "name unit");

    res.status(200).json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching aggregated requests",
      error: err.message,
    });
  }
};

// District Admin: approve & send aggregation to HQ
const approveDistrictRequests = async (req, res) => {
  try {
    const { requestIds } = req.body; // Array of request IDs to approve
    if (!requestIds || !requestIds.length)
      return res.status(400).json({ message: "No requests selected" });

    const approvedRequests = [];
    for (let id of requestIds) {
      const reqItem = await Request.findById(id);
      if (!reqItem) continue;
      reqItem.status = "approved";
      await reqItem.save();
      approvedRequests.push(reqItem);
    }

    // Automatic aggregation to HQ
    for (let r of approvedRequests) {
      const hqRequest = new Request({
        product: r.product,
        quantity: r.quantity,
        unit: r.unit,
        createdBy: req.user._id, // district creates aggregated request
        level: "district",
        parentId: null, // HQ level
        remarks: `Aggregated from district: ${req.user.fullName}`,
        status: "pending",
      });
      await hqRequest.save();
    }

    res.status(200).json({
      message: "Requests approved and sent to HQ",
      approvedRequests,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error approving district requests",
      error: err.message,
    });
  }
};

// HQ: view all aggregated requests (from districts + regions)
const getHQAggregatedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("product", "name unit")
      .sort({ createdAt: -1 });

    const totals = {};
    for (let r of requests) {
      const key = r.product.name + " (" + r.unit + ")";
      totals[key] = (totals[key] || 0) + r.quantity;
    }

    res.status(200).json({ count: requests.length, requests, totals });
  } catch (err) {
    res.status(500).json({ message: "Error fetching HQ requests", error: err.message });
  }
};

// HQ: approve request
const approveHQRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "approved";
    await request.save();

    res.status(200).json({ message: "Request approved at HQ", request });
  } catch (err) {
    res.status(500).json({
      message: "Error approving request at HQ",
      error: err.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getDistrictAggregatedRequests,
  approveDistrictRequests,
  getHQAggregatedRequests,
  approveHQRequest,
};
