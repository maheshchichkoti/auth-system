const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs").promises;
const generateOTP = require("../utils/generateOTP");
const { sendOTPEmail } = require("../utils/emailService");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, company, age, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Delete uploaded image if user exists
      if (req.file) {
        const imagePath = path.join(
          __dirname,
          "../../uploads",
          req.file.filename
        );
        await fs.unlink(imagePath).catch(console.error);
      }
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      company,
      age,
      dateOfBirth,
      profileImage: req.file.filename,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Delete uploaded image on error
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        req.file.filename
      );
      await fs.unlink(imagePath).catch(console.error);
    }

    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Sorry, we can't log you in." });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Sorry, we can't log you in." });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    await new OTP({ email, otp }).save();

    // Send OTP via email (in production)
    // For development, you might want to comment this out and log the OTP instead
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.log("Development OTP:", otp); // For testing when email is not configured
    }

    res.json({
      message: "OTP sent to your email",
      email,
      // In development only - remove in production!
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // Delete used OTP
    await OTP.deleteMany({ email });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        age: user.age,
        dateOfBirth: user.dateOfBirth,
        profileImage: `/uploads/${user.profileImage}`,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        age: user.age,
        dateOfBirth: user.dateOfBirth,
        profileImage: `/uploads/${user.profileImage}`,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user's profile image
    const imagePath = path.join(__dirname, "../../uploads", user.profileImage);
    await fs.unlink(imagePath).catch(console.error);

    // Delete user
    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  getProfile,
  deleteAccount,
};
