const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true }, // e.g., kg, liters, pieces
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Register the model as 'Product' so Request.schema ref('Product') will work
module.exports = mongoose.model('Product', productSchema);
