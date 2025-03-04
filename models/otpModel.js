import mongoose from 'mongoose';

// Define the Otp schema
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Ensure each email is unique
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Email regex to validate the format
          return /\S+@\S+\.\S+/.test(v);
        },
        message: props => `${props.value} is not a valid email!`,
      },
    },
    otp: {
      type: String,
      required: true,
      minlength: [6, 'OTP must be 6 characters long'], // Typically, OTP length is 6 characters
      maxlength: [6, 'OTP must be 6 characters long'],
    },
    otpExpires: {
      type: Date,
      required: true,
      default: Date.now, // Set default to current time for expiration
    },
  },
  { timestamps: true }
);

// Create and export the model
const otpModel = mongoose.model('Otp', otpSchema);

export default otpModel;
