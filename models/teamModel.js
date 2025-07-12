import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["sudo", "team"],
      required: true,
    },
    password: {
      type: String,
      required: false,
      default : ''
    },
    phone: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    profileImage: {
      type: mongoose.Types.ObjectId,
      ref: "ProfileImage",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate username from email if not provided
teamSchema.pre("save", function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  }
  next();
});

const teamModel = mongoose.model("Team", teamSchema);
export default teamModel;