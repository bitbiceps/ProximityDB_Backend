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
    updatedContent:{type:String, default:""},

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
    metaData: {
      termsAndCondition: { type: Boolean, default: false },
      companyName: { type: Boolean, default: false },
      authorName: { type: Boolean, default: false },
      outlets: [{
        Outlets_Name: String,
        Reporter_Byline: String,
        Concerned_Agency: String,
        Reach: String,
        Backdating: String,
        Genre_Beat: [String],
        AI_Generated_Content: String,
        Byline_Without_Author: String,
        By_Desk: String,
        Cost: String
      }],
      selectedOutlet :{type : String , default : null}
          },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the Article model using the schema
const articleModel = mongoose.model("Article", articleSchema);

export default articleModel;
