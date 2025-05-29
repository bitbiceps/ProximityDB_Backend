import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true }, // can be user or team member id
  senderRole: { type: String, enum: ["user", "team"], required: true },
  text: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // track who read it
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TeamMessage", teamMessageSchema);
