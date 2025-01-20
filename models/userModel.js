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
        1: {
          question: {
            type: String,
            default: "Could you please describe your role or job title?",
          },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default: "Please specify your industry or field of work.",
          },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "What specific areas of your craft or industry do you have the most knowledge in? List them in a high to low order.",
          },
          answer: { type: String, default: "" },
        },
        4: {
          question: {
            type: String,
            default:
              "What about the problems that you can apply your skills to is not working well right now? How could it improve?",
          },
          answer: { type: String, default: "" },
        },
      },
      secondary: {
        1: {
          question: {
            type: String,
            default:
              "What are all the possible end applications of your past and present work?",
          },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default:
              "What are the gaps in your industry or workplace in general? What areas are underserved? Please explain.",
          },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "What are five of the biggest impactful projects you have worked on, and what are your proudest career accomplishments?",
          },
          answer: { type: String, default: "" },
        },
        4: {
          question: {
            type: String,
            default:
              "How can you demonstrate that you are THE expert? Describe the specific solutions and results you can provide.",
          },
          answer: { type: String, default: "" },
        },
        5: {
          question: {
            type: String,
            default:
              "What specific solutions are other people working on or providing in your field that are working well?",
          },
          answer: { type: String, default: "" },
        },
        6: {
          question: {
            type: String,
            default:
              "What specific skills and abilities do you have that are very specialized and there might be fewer people in?",
          },
          answer: { type: String, default: "" },
        },
        7: {
          question: {
            type: String,
            default:
              "List out the approximate size of each of the spaces/fields. How many people are working? If you are to compete with all others in different specific niches, how many other people would you be competing in each case?",
          },
          answer: { type: String, default: "" },
        },
        8: {
          question: {
            type: String,
            default:
              "What were five of your biggest challenges on the way to the above accomplishments?",
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
