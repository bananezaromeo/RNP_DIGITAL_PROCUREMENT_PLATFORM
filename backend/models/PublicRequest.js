const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    product: { type: String, required: true }, // Product name (will reference catalog later)
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, default: 'kg' },
    date: { type: Date, required: true }, // Date of request or needed by
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'AGGREGATED', 'FULFILLED'],
      default: 'PENDING'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: {
      type: String,
      enum: ['station', 'special_unit', 'district', 'region', 'hq'],
      required: true
    },
    notes: { type: String },
    // For future: aggregation, parentRequest, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', RequestSchema);
