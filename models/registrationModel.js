import mongoose from "mongoose";
import validator from "validator";
import { v4 as uuidv4 } from "uuid"; // Install UUID for unique identifiers

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true, // Ensures each registration is unique
      default: () => uuidv4(), // Automatically generates a UUID
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "First name cannot be more than 120 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "Last name cannot be more than 120 characters"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please enter a valid email address",
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) =>
          validator.isMobilePhone(value, "any", { strictMode: true }),
        message: "Please enter a valid phone number",
      },
    },
    prRequireFor: {
      type: [String],
      required: true,
    },
    prObjective: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Add a compound index for sorting and querying efficiently
registrationSchema.index({ email: 1, createdAt: -1 });

const registrationModel = mongoose.model("Registration", registrationSchema);
export default registrationModel;
