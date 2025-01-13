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
    profileImage: { type: mongoose.Types.ObjectId, ref:"Image", default:"" }
  },
  { timestamps: true }
);


userSchema.virtual("topics", {
  ref: "Topic",
  localField: "_id",
  foreignField: "userId",
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

export default mongoose.model("User", userSchema);
