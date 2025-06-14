import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions." });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail && !existingEmail.isVerified) {
      await sendVerificationEmail(existingEmail.email, token);
      return res.status(200).json({ message: "Verification email sent" });
    }else if(existingEmail && existingEmail.isVerified){
      return res
        .status(400)
        .json({ message: "Email is already registered" });
    }

    // const existingPhoneNumber = await userModel.findOne({ phoneNumber });
    // if (existingPhoneNumber) {
    //   return res
    //     .status(400)
    //     .json({ message: "Phone number is already registered" });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sendVerificationEmail(email, token);

    const newUser = await userModel.create({
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

    // Find the userModel by the email encoded in the token
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // Check if the userModel is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "user is already verified" });
    }

    // Verify the userModel
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


const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  const refreshToken = jwt.sign(
    { userId: user._id , fullName : user.fullName },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return {accessToken , refreshToken};
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel
      .findOne({ email })
      .populate("topics profileImage");
    if (!user) {
      return res.status(400).json({ message: "user does not exists" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "user is not verified" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const {accessToken , refreshToken } = generateTokens(user);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { 
        $set: { 
          accessToken: accessToken,
          refreshToken: refreshToken,
        } 
      },
      { new: true }
    );

 
      res.cookie('accessToken', accessToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.cookie('refreshToken', refreshToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

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
    const { userId } = req.params; // userModel ID should be passed as a parameter

    // Fetch the userModel and populate their articles
    const userModel = await userModel.findById(userId).populate("articles");

    if (!userModel) {
      return res.status(404).json({ message: "userModel not found" });
    }



    res.status(200).json({
      message: "UPdated Articles fetched successfully",
      articles: userModel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching articles", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    return res.status(200).json({
      message : "Authorized",
      user : req.user,
      userId : req.userId
    });

  } catch (error) {
    return res.status(401).json({ message: "Not Authorized" });
  }
};

export const handleResetPassword = async (req, res) => {
  try {
    const { email } = req.body; // Email is provided in the request body
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "user does not exist." });
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

    // OTP is valid, find the userModel (employee)
    const user = await userModel.findOne({ email }).exec();

    if (!user) {
      return res.status(404).json({ error: "user not found." });
    }

    // OTP is valid and userModel is found, you can proceed with password reset logic here
    // For example, you can update the password here
    // userModel.password = newPassword; // Set new password (hashed)
    // await userModel.save();

    // Respond with success message (userModel found and OTP verified)
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

    // Find the userModel by email
    const user = await userModel.findOne({ email });

    // If userModel is not found
    if (!user) {
      return res.status(404).json({ message: "user not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the userModel's password
    user.password = hashedPassword;

    // Save the updated userModel
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

export const handleGoogleLogin = async (req, res) => {
  try {
    const googleUser = req.user; // <-- This is the Passport user object

    if (!googleUser) {
      return res
        .status(400)
        .json({ message: "No user info found from Google" });
    }

    console.log("Google profile:", googleUser);

    const email =
      googleUser.emails && googleUser.emails.length > 0
        ? googleUser.emails[0].value
        : null;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email not found in Google profile" });
    }

    const fullName = googleUser.displayName || "No Name";

    let user = await userModel.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await userModel.create({
        fullName,
        email,
        termsAccepted: true,
        isVerified: true,
        paymentStatus: true,
      });
    }

    const {accessToken  , refreshToken } = generateTokens(user);

    res.cookie('accessToken', accessToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

    res.cookie('refreshToken', refreshToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });

    res.redirect(`${process.env.FRONTEND_URL}`);

  } catch (error) {
    console.error("Google login error:", error);
    return res
      .status(500)
      .json({ message: "Google login failed", error: error.message });
  }
};

export const handleLinkedInLogin = async (req, res) => {
  try {
    const linkedInUser = req.user;
    console.log("LinkedIn profile:", linkedInUser);

    const email = linkedInUser.emails?.[0]?.value;
    const fullName = linkedInUser.displayName;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        fullName,
        email,
        termsAccepted: true,
        isVerified: true,
        paymentStatus: true,
      });
    }

    const {accessToken  , refreshToken } = generateTokens(user);

    res.cookie('accessToken', accessToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

    res.cookie('refreshToken', refreshToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });

    res.redirect(`${process.env.FRONTEND_URL}`);
    
  } catch (error) {
    console.error("LinkedIn login error:", error);
    return res
      .status(500)
      .json({ message: "LinkedIn login failed", error: error.message });
  }
};


export const handleLogout = async (req, res) => {
  try {
    const userId = req.userId;
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    if (userId) {
      await userModel.findByIdAndUpdate(userId, {
        $unset: {
          accessToken: 1,
          refreshToken: 1
        },
      });
    }

    res.status(200).json({
      message: "Logout successful",
      code: "LOGOUT_SUCCESS"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Logout failed",
      code: "LOGOUT_ERROR",
      error: error.message
    });
  }
};