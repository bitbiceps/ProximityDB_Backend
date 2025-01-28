import mongoose from "mongoose";

const articleImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  article: { type: mongoose.Types.ObjectId, ref: "Article" },
});

export default mongoose.model("ArticleImage", articleImageSchema);
