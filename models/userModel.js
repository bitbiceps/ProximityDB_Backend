import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    planId: { type: Number, default: 0 },
    paymentStatus: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, required: true },
    isVerified: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
    profileImage: {
      type: mongoose.Types.ObjectId,
      ref: "Image",
    },
    gender: { type: String, default: null },
    roleJobTitle: { type: String, default: "" },
    industryFieldOfWork: { type: String, default: "" },

    // Use a sub-schema for the questionnaire
    questionnaire: {
      primary: {
        fieldOrIndustry: {
          question: {
            type: String,
            default: "What field or industry do you primarily work in?",
          },
          answer: { type: String, default: "" },
        },
        skillOrArea: {
          question: {
            type: String,
            default: "What is your primary skill or area of expertise?",
          },
          answer: { type: String, default: "" },
        },
        mainOutcome: {
          question: {
            type: String,
            default:
              "What’s the main outcome you seek from using this platform/product?",
          },
          answer: { type: String, default: "" },
        },
      },
      optional: {
        specialization: {
          question: {
            type: String,
            default: "What areas of your field do you specialize in?",
          },
          answer: { type: String, default: "" },
        },
        problemToSolve: {
          question: {
            type: String,
            default:
              "What specific problem are you looking to solve or improve in your work?",
          },
          answer: { type: String, default: "" },
        },
      },
      advanced: {
        applicationOfWork: {
          question: {
            type: String,
            default: "What are the applications of your work?",
          },
          answer: { type: String, default: "" },
        },
        industrialGaps: {
          question: {
            type: String,
            default: "What are the biggest gaps in your industry?",
          },
          answer: { type: String, default: "" },
        },
        accomplishments: {
          question: {
            type: String,
            default: "What are your biggest accomplishments?",
          },
          answer: { type: String, default: "" },
        },
        uniqueSolution: {
          question: {
            type: String,
            default: "What unique solutions or insights can you provide?",
          },
          answer: { type: String, default: "" },
        },
      },
    },
  },
  { timestamps: true }
);

// Define virtual for related topics
userSchema.virtual("topics", {
  ref: "Topic",
  localField: "_id",
  foreignField: "userId",
});

// Make virtual fields available in toObject and toJSON output
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

// Export the User model
export default mongoose.model("User", userSchema);
