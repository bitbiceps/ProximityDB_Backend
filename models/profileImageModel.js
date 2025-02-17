import mongoose from "mongoose";

const profileImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: "User" },
});

export default mongoose.model("ProfileImage", profileImageSchema);
