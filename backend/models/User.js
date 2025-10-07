const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Common fields
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },

  // Role: supplier or one of admin levels
  role: {
    type: String,
    enum: ['supplier', 'district', 'region', 'hq', 'station'],
    required: true,
    default: 'supplier'
  },

  // Supplier specific fields
  supplierType: {
    type: String,
    enum: ['individual', 'cooperative'],
    required: function () {
      return this.role === 'supplier';
    },
  },
  cooperativeName: { type: String },
  companyName: { type: String, default: '' },

  // Admin-specific location hierarchy
  province: { type: String },
  district: { type: String },
  sector: { type: String },

  // Account status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function () {
      // HQ admins auto-approved, others pending
      return this.role === 'hq' ? 'approved' : 'pending';
    },
  },

  // Supplier uploads
  uploads: {
    national_id: { type: String },
    business_license: { type: String },
  },
}, { timestamps: true });

// Virtual for setting password
UserSchema.virtual('password')
  .set(function (password) {
    this._password = password;
    this.passwordHash = bcrypt.hashSync(password, 10);
  });

// Compare password method
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
