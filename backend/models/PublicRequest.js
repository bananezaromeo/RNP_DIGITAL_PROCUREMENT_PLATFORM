const mongoose = require('mongoose');

const PublicRequestSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },        // e.g. "Irish Potatoes"
    totalQuantityKg: { type: Number, required: true }, // e.g. 12000
    deadline: { type: Date, required: true },         // e.g. "Next Friday"
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    postedBy: { type: String, default: 'HQ Procurement Team' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PublicRequest', PublicRequestSchema);
