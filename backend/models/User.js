// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  supplierType: { type: String, enum: ['individual', 'cooperative'], required: true },
  fullName: { type: String }, // required if individual
  cooperativeName: { type: String }, // required if cooperative
  companyName: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['supplier','district','region','hq','station'], default: 'supplier' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  province: { type: String },
  district: { type: String },
  sector: { type: String },
  uploads: {
    national_id: { type: String },         // path to uploaded national id file
    business_license: { type: String },    // path to uploaded rdb/business certificate
  },
}, { timestamps: true });

// virtual for setting password
UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.passwordHash = bcrypt.hashSync(password, 10);
  });

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
