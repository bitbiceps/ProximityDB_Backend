// models/ticketModel.js
import mongoose from "mongoose";
import CounterModel from "./ticketCounterModel.js";

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  subTopic: { type: String, required: false },
  description: { type: String, required: false },
  status: {
    type: String,
    enum: ["open", "pending", "closed"],
    default: "open",
  },
  ticketId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketId) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "ticket" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.ticketId = `TKT${counter.seq}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
const ticketModel = mongoose.model("Ticket", ticketSchema);
export default ticketModel;
