import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import userModel from "../models/userModel.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../helpers/mailer.js";
import { randomBytes } from "crypto"; // To generate OTP
import otpModel from "../models/otpModel.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, termsAccepted } = req.body;
    console.log('body', req.body);

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // const existingPhoneNumber = await User.findOne({ phoneNumber });
    // if (existingPhoneNumber) {
    //   return res
    //     .status(400)
    //     .json({ message: "Phone number is already registered" });
    // }


    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });

    sendVerificationEmail(email, token);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      termsAccepted,
      paymentStatus: true,
    });


    return await res
      .status(201)
      .json({ message: "Verification email sent", userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", error: error.message });
    }

    // Find the user by the email encoded in the token
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Verify the user
    user.isVerified = true;
    await user.save();

    // Send a success response
    res.status(200).json({ message: "Email verified. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error); // Log the error for debugging purposes
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("topics profileImage");
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }

    if(!user.isVerified) {
      return res.status(400).json({ message: "User is not verified" }); 
      }
    // io.emit(socketEvents.TEST__BROADCAST, {
    //   message: "Socket working successfully",
    // });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const refreshToken = "";
    res.status(200).json({
      message: "Login successful",
      tokens: { accessToken, refreshToken },
      userId: user._id,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
export const getUserArticles = async (req, res) => {
  try {
    const { userId } = req.params; // User ID should be passed as a parameter

    // Fetch the user and populate their articles
    const user = await User.findById(userId).populate("articles");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "UPdated Articles fetched successfully",
      articles: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching articles", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Extract token from the Authorization header or body (you can adjust as needed)
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify and decode the token (use jwt.verify instead of jwt.decode for security)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Find the user from the database by userId
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data if found
    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "Not Authorized" });
  }
};

export const handleResetPassword = async (req, res) => {
  try {
    const { email } = req.body; // Email is provided in the request body
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User does not exist." });
    }

    // Generate a simple OTP
    const otp = randomBytes(3).toString("hex"); // 3 bytes will give a 6-character hex OTP
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    // Upsert the OTP document for the employee (either create or update)
    await otpModel.findOneAndUpdate(
      { email },
      { otp, otpExpires: expires },
      { upsert: true }
    );

    await sendPasswordResetEmail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to send OTP. " + error.message });
  }
};

export const handleVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body; // Extract email and OTP from request body

    // Find the OTP entry in the database
    const otpEntry = await otpModel.findOne({ email });

    if (!otpEntry) {
      return res
        .status(400)
        .json({ error: "OTP entry not found for this email." });
    }

    // Validate the OTP
    if (otpEntry.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP provided." });
    }

    // Check if the OTP has expired
    if (otpEntry.otpExpires < new Date()) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    // OTP is valid, find the user (employee)
    const user = await userModel.findOne({ email }).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // OTP is valid and user is found, you can proceed with password reset logic here
    // For example, you can update the password here
    // user.password = newPassword; // Set new password (hashed)
    // await user.save();

    // Respond with success message (user found and OTP verified)
    await otpModel.deleteOne({ email });
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to verify OTP. " + error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password, email } = req.body; // Extract password and email from request body

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ message: "New password cannot be empty." });
    }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email cannot be empty." });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });

    // If user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    // Return success response
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    // Handle any errors
    return res
      .status(500)
      .json({ error: "Failed to change password. " + error.message });
  }
};
