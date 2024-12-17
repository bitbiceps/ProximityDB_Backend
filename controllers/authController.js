import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, termsAccepted } = req.body;

    console.log(fullName, email, password, phoneNumber, termsAccepted);

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: 'You must agree to the terms and conditions.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ message: 'Phone number is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      termsAccepted,
    });

    res
      .status(201)
      .json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate Access Token (short-lived)
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    // Generate Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // Use a separate secret for refresh tokens if available
      { expiresIn: '7d' }
    );

    // Optionally, save the refresh token in the database if needed
    user.refreshToken = refreshToken; // Assumes `refreshToken` is a field in your User model
    await user.save();

    // Send tokens in the response
    res.status(200).json({
      message: 'Login successful',
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'User home' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
