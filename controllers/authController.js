import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohd.k@saimanshetty.com",
    pass: "dhop yevr fmak mggi",
  },
});
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, termsAccepted } = req.body;
    console.log("req.bbbbbbbbbb", req.body);
    console.log(fullName, email, password, phoneNumber, termsAccepted);

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      termsAccepted,
    });
        const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, {
            expiresIn: "4d",
          });
          const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;
      
          await transporter.sendMail({
            from: "mohd.k@saimanshetty.com",
            to: email,
            subject: "Verify your email",
            text: `Click the link to verify your account: ${verificationLink}`,
          });
    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified. You can now log in." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
     console.log("req",req.body)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email to log in." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    console.log("tok",accessToken)

    const refreshToken=""
    res.status(200).json({
      message: "Login successful",
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
