import mongoose from "mongoose";
var paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  planId: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    "default": "inr"
  },
  status: {
    type: String,
    "default": "pending"
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});
export default mongoose.model("Payment", paymentSchema);