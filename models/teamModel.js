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
    },
    role: {
      type: String,
      enum: ["sudo", "team"],
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate username from email
teamSchema.pre("save", function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  }
  next();
});

const teamModel = mongoose.model("Team", teamSchema);
export default teamModel;
