import mongoose from "mongoose";

// Define the Article schema
const articleSchema = new mongoose.Schema(
  {
    // Content of the article (e.g., title, description, etc.)
    value: {
      type: String,
      required: true,
      default: ""
    },

    // Boolean to track if the article has been submitted
    submitted: {
      type: Boolean,
      default: false
    },

    // Array of ObjectIds to store references to the topics
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic', // Reference to the Topic model/collection
        required: true
      }
    ],

    // Photo related to the article, initially null
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo', // Assuming 'Photo' is the name of the related collection for photo documents
      default: null
    },

    // Boolean to track if a change is requested for the article
    changeRequested: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the Article model using the schema
const articleModel = mongoose.model('Article', articleSchema);

export default articleModel;
