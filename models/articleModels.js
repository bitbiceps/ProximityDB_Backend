import mongoose from "mongoose";

// Define the Article schema
const articleSchema = new mongoose.Schema(
  {
    // // Content of the article
    value: {
      type: String,
      default: "",
    },

    // Status to track the article submission state
    status: {
      type: String,
      default: "pending", // default value set to 'pending'
    },

    // Reference to a single Topic document (ObjectId or null)
    topics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Topic model/collection
    },

    // Boolean to track if a change is requested for the article
    updateRequested: {
      type: Boolean,
      default: false,
    },

    // // Reference to the User document
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic", // Reference to the User model/collection
      required: true, // Ensures every article is associated with a user
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Topic model/collection
    },
    profileImage: {
      type: mongoose.Types.ObjectId,
      ref: "ArticleImage",
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the Article model using the schema
const articleModel = mongoose.model("Article", articleSchema);

export default articleModel;
