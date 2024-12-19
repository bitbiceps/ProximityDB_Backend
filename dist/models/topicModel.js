import mongoose from "mongoose";

// Define the Topic schema
var topicSchema = new mongoose.Schema({
  // Array of topics where each topic has additional fields like `updateRequested` and `verifyRequested`
  topics: {
    type: [{
      value: String,
      updateRequested: {
        type: Boolean,
        "default": false
      },
      verifyRequested: {
        type: Boolean,
        "default": false
      }
    }],
    "default": []
  },
  // Boolean to track if the article has been submitted
  submitted: {
    type: Boolean,
    "default": false
  },
  // Suggestion as a plain object
  suggestion: {
    type: String,
    "default": null
  }
}, {
  timestamps: true
});

// Create the Topic model using the schema
var topicModel = mongoose.model("Topic", topicSchema);
export default topicModel;