import mongoose from "mongoose";

// Define the Topic schema
const topicSchema = new mongoose.Schema(
  {
    // Array of topics or null if no topics
    topics: {
      type: [String], // Array of strings for topic names
      default: [], // Default is an empty array, but can be null if no topics exist
    },

    // Boolean to track if the article has been submitted
    submitted: {
      type: Boolean,
      default: false,
    },

    // Boolean flag to track if an update is requested for the topic
    updateRequested: {
      type: Boolean,
      default: false, // Default is false
    },

    // Boolean flag to track if verification is requested for the topic
    verifyRequested: {
      type: Boolean,
      default: false, // Default is false
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the Topic model using the schema
const Topic = mongoose.model("Topic", topicSchema);

export default Topic;
