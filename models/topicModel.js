import mongoose from "mongoose";

// Define the Topic schema
const topicSchema = new mongoose.Schema(
  {
    // Array of topics where each topic has additional fields like `updateRequested` and `verifyRequested`
    topics: {
      type: [
        {
          value: String,
          updateRequested: { type: Boolean, default: false },
          verifyRequested: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    status: {
      type: String,
      default: "pending", // default value set to 'pending'
    },

    // Suggestion as a plain object
    suggestion: {
      type: {
        topic: { type: String, required: true },
        message: { type: String, required: true }
      },
      default : null
    },    
    // Suggestion as a plain object
    finalTopic: {
      type: String,
      default: null,
    },
    articleStatus: {
      type: String,
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Topic model/collection
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article", // Reference to the Topic model/collection
      default: null,
    },
  },
  { timestamps: true }
);

// Create the Topic model using the schema
const topicModel = mongoose.model("Topic", topicSchema);

export default topicModel;
