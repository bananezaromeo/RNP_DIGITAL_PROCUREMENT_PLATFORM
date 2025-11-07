const Request = require('../models/Request');
const Product = require('../models/Product');
const User = require('../models/User');

// 1️⃣ Create Request
const createRequest = async (req, res) => {
  try {
    const { productId, quantity, week } = req.body;
    if (!productId || !quantity || !week) 
      return res.status(400).json({ message: 'Product, quantity, and week are required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const request = new Request({
      product: product._id,
      quantity,
      quantityUnit: product.unit,
      createdBy: req.user._id,
      level: req.user.role, // station, specialUnit, district, region
      week
    });

    await request.save();
    res.status(201).json({ message: 'Request created', request });
  } catch (err) {
    res.status(500).json({ message: 'Error creating request', error: err.message });
  }
};

// 2️⃣ Get Requests
const getRequests = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};

    switch(user.role) {
      case 'station':
      case 'specialUnit':
        filter = { createdBy: user._id };
        break;
      case 'district':
        filter = { aggregatedTo: user._id, level: { $in: ['station', 'specialUnit'] } };
        break;
      case 'region':
        filter = { aggregatedTo: user._id, level: { $in: ['district'] } };
        break;
      case 'hq':
        filter = { level: { $in: ['district', 'region'] } };
        break;
      default:
        filter = {};
    }

    const requests = await Request.find(filter)
      .populate('product', 'name unit')
      .populate('createdBy', 'fullName cooperativeName role');

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

// 3️⃣ Get Request by ID
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('product', 'name unit')
      .populate('createdBy', 'fullName cooperativeName role');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching request', error: err.message });
  }
};

// 4️⃣ Update Request
const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const { quantity, status, remarks } = req.body;
    if (quantity) request.quantity = quantity;
    if (status) request.status = status;
    if (remarks) request.remarks = remarks;

    await request.save();
    res.status(200).json({ message: 'Request updated', request });
  } catch (err) {
    res.status(500).json({ message: 'Error updating request', error: err.message });
  }
};

// 5️⃣ Delete Request
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await request.remove();
    res.status(200).json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting request', error: err.message });
  }
};

// 6️⃣ Aggregate Requests (district → HQ)
const aggregateRequests = async (req, res) => {
  try {
    const { week } = req.body;
    if (!week) return res.status(400).json({ message: 'Week is required' });

    // Find all unaggregated requests for this user’s district
    const requests = await Request.find({ 
      aggregated: false, 
      aggregatedTo: req.user._id,
      week
    });

    // Mark as aggregated
    await Request.updateMany(
      { _id: { $in: requests.map(r => r._id) } },
      { $set: { aggregated: true } }
    );

    res.status(200).json({ message: 'Requests aggregated', count: requests.length });
  } catch (err) {
    res.status(500).json({ message: 'Error aggregating requests', error: err.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  aggregateRequests
};
