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
  },
  { timestamps: true }
);

// Virtual field to populate articles associated with the user
userSchema.virtual("topics", {
  ref: "Topic", // The model to use (ensure Article is registered in Mongoose)
  localField: "_id", // Field in the User model
  foreignField: "userId", // Field in the Article model
});

// Ensure virtuals are included in JSON and object outputs
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

export default mongoose.model("User", userSchema);
