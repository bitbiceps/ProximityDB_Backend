import mongoose from "mongoose";
var userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  planId: {
    type: Number,
    "default": 0
  },
  paymentStatus: {
    type: Boolean,
    "default": false
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  isVerified: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true
});
export default mongoose.model("User", userSchema);