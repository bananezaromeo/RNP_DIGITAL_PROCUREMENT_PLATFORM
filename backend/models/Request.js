const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // ref to Product model
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: {
    type: String,
    enum: ['station', 'specialUnit', 'district', 'region', 'hq', 'supplier'],
    required: true
  },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // district or region owner
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
