const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
  isVerified: { type: Boolean, default: false } // New field
});

module.exports = mongoose.model('User', userSchema);
