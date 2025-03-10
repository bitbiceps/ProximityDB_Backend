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
    dateOfBirth : {type : Date , default : null},
    profileImage: {
      type: mongoose.Types.ObjectId,
      ref: "ProfileImage",
    },
    numberOfReviews:{type:Number, default:0},
    gender: { type: String, default: null },
    // Use a sub-schema for the questionnaire
    questionnaire: {
      basicInformation: {
        1: {
          question: {
            type: String,
            default:
              "What fields or industries do you work in?",
          },
          questionType: { type: String, default: "select" }, 
          mandatory: { type: Boolean, default: true },
          options : {
            type : [String],
            default : [
              "Software and IT",
              "Finance and Banking",
              "Healthcare and Medicine",
              "Education and Research",
              "Marketing and Advertising",
              "Sales and Business Development",
              "Human Resources",
              "Manufacturing and Engineering",
              "Legal and Compliance",
              "Creative and Design"
            ]
          },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default: "Could you please describe your role or job title?",
          },
          questionType: { type: String, default: "select" }, 
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "What is the name of the Company/Organization you work in?",
          },
          questionType: { type: String, default: "input" }, 
          mandatory: { type: Boolean, default: false },
          answer: { type: String, default: "" },
        },
      },
      expertiseAndSkills: {
      1: {
          question: {
            type: String,
            default:
              "What specific areas of your craft or industry do you have the most knowledge in? List them in high to low order.",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default:
              "What specialized skills or experience do you have or can develop that most other people don’t have, or do not think about having? Please describe in detail.",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "What other variations of applications can your skills be applied to?",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        4: {
          question: {
            type: String,
            default:
              "What are all the possible end applications of your past and present work?",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        5: {
          question: {
            type: String,
            default:
              "Please enlist all of your published work within the context of the subject matter being covered in this article (Research Papers, Scholarly articles, Media coverage, Blogs, etc.).",
          },
          mandatory: { type: Boolean, default: false },
          answer: { type: String, default: "" },
        },
      },
      challengesAndGaps: {
        1: {
          question: {
            type: String,
            default:
              "What about the problems that you can apply your skills to that are not working well right now? How could it improve?",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default:
              "What are the gaps in your industry or workplace in general? What areas are underserved? Please explain.",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "What are some major challenges that you successfully overcame as part of your involvement in the concerned area of work, which in turn allowed you to achieve a great result? ",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
      },
      impactAndAchievements: {
        1: {
          question: {
            type: String,
            default:
              "What professional achievements have you secured while working on the subject matter of this article?   *(List major achievements: scaling the corporate/academic ladder, associating with major organizations, etc.)*",
          },
          mandatory: { type: Boolean, default: false },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default:
              "What are five of the biggest impactful projects you have worked on, and what are your proudest career accomplishments? ",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "How have you been able to create an impact at your workplace through your work in the capacity of a crucial member of your organization, by being involved and participating in the area of work that this particular article would cover?  *(Enlist and describe impact in terms of tangible metrics like cost savings, revenue increments, efficiency increments, etc.)*",
          },
          mandatory: { type: Boolean, default: false },
          answer: { type: String, default: "" },
        },
        4: {
          question: {
            type: String,
            default:
              "What are some of your works or results that can be measured in quantifiable terms (in the context of the subject matter at hand)? Also share the quantified figures.",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        5: {
          question: {
            type: String,
            default:
              "How can you demonstrate that you are THE expert? Describe the specific solutions and results you can provide.",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        6: {
          question: {
            type: String,
            default:
              "What specific solutions are other people working on or providing in your field that are working well?",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
      },
      industryContextAndInsights: {
        1: {
          question: {
            type: String,
            default:
              "From the standpoint of an experienced professional in this particular arena/category of work, what are your original thoughts and insights in relevance to what you do/have done?  *(You may also share insights on current or upcoming trends and practices and firsthand suggestions from having worked on major projects.)*",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        2: {
          question: {
            type: String,
            default:
              "What aspects are most important to you when it comes to your work and the products/services that you work on?",
          },
          mandatory: { type: Boolean, default: true },
          answer: { type: String, default: "" },
        },
        3: {
          question: {
            type: String,
            default:
              "List out the approximate size of each of the spaces/fields. How many people are working? If you are to compete with others in specific niches, how many other people would you be competing against in each case?",
          },
          mandatory: { type: Boolean, default: true },
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
