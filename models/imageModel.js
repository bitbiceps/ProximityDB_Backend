import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  type:{type:String,default:""},
  user:{type:mongoose.Types.ObjectId, ref:"User"}
});

export default mongoose.model('Image', imageSchema);

