// backend/models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, default: 'kg' }, // flexibility for future units
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: {
    type: String,
    enum: ['station', 'specialUnit', 'district', 'region', 'hq', 'supplier'],
    required: true
  },
  aggregatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // district/region/HQ aggregated requests
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String },
  week: { type: Number, required: true }, // track weekly aggregation
  aggregated: { type: Boolean, default: false } // has this request been aggregated upstream
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
