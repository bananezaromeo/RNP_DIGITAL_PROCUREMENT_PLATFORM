// backend/models/AggregatedRequest.js
const mongoose = require('mongoose');

const AggregatedRequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // district owner
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional region
  totalQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g. "kg", or "units"
  // status: pending (waiting for HQ), submitted (district submitted), approved (HQ approved)
  status: { type: String, enum: ['pending', 'submitted', 'approved'], default: 'pending' },
  // list of individual requests included (array of request ids)
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // usually district admin
}, { timestamps: true });

module.exports = mongoose.model('AggregatedRequest', AggregatedRequestSchema);
