const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohd.k@saimanshetty.com",
    pass: "dhop yevr fmak mggi",
  },
});

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      if (!existingEmail.isVerified) {
        const token = jwt.sign(
          { email: existingEmail.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;

        await transporter.sendMail({
          from: "mohd.k@saimanshetty.com",
          to: email,
          subject: "Verify your email",
          text: `Click the link to verify your account: ${verificationLink}`,
        });

        return res.status(200).json({
          message:
            "User already registered but not verified. A new verification email has been sent.",
        });
      }

      return res
        .status(400)
        .json({ message: "Email is already registered and verified." });
    }

    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber && existingPhoneNumber.isVerified) {
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
      expiresIn: "1h",
    });
    const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;

    await transporter.sendMail({
      from: "mohd.k@saimanshetty.com",
      to: email,
      subject: "Verify your email",
      text: `Click the link to verify your account: ${verificationLink}`,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      userId: newUser._id,
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
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

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
