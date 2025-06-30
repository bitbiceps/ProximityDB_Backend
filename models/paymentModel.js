import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  sessionId: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  username : {type : String , required : false},
  email : {type : String , required : false},
  amount: { type: Number, required: false },
  planId: { type: String, required: false },
  currency: { type: String, default: "inr" },
  status: { type: String, default: "pending" },
  paymentIntentId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
