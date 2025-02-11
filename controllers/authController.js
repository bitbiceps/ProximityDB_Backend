import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vinay.m@saimanshetty.com",
    pass: "vinay@cachelabs",
  },
});
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("eeeeee", existingEmail);
      return res.status(400).json({ message: "Email is already registered" });
    }

    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      termsAccepted,
      isVerified: true,
      paymentStatus: true,
    });
    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });
    // const verificationLink = `https://api.proximity.press/api/auth/verify/${token}`;

    // await transporter.sendMail({
    //   from: "vinay.m@saimanshetty.com",
    //   to: email,
    //   subject: "Verify your email",
    //   text: `Click the link to verify your account: ${verificationLink}`,
    // });
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
    // console.log("user", user);
    user.isVerified = true;
    console.log("userStatus", user.isVerified);
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
    const user = await User.findOne({ email }).populate("topics profileImage");
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }

    // if (!user.isVerified) {
    //   return res
    //     .status(400)
    //     .json({ message: "Please verify your email to log in." });
    // }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    // console.log("tok", accessToken);

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
    // console.log("artttttttttttt", userId);

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
