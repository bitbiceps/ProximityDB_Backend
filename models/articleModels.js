import mongoose from "mongoose";

// Define the Article schema
const articleSchema = new mongoose.Schema(
  {
    // Content of the article
    value: {
      type: String,
      required: true,
      default: "",
    },

    // Boolean to track if the article has been submitted
    submitted: {
      type: Boolean,
      default: false,
    },

    // Reference to a single Topic document (ObjectId or null)
    topics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic", // Reference to the Topic model/collection
      default: null, // Default is null, meaning no topic is associated initially
    },

    // Photo related to the article, initially null
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo", // Assuming 'Photo' is the name of the related collection for photo documents
      default: null,
    },

    // Boolean to track if a change is requested for the article
    changeRequested: {
      type: Boolean,
      default: false,
    },

    // Reference to the User document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model/collection
      required: true, // Ensures every article is associated with a user
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the Article model using the schema
const articleModel = mongoose.model("Article", articleSchema);

export default articleModel;
