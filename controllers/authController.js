import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from 'google-auth-library'; 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ============================
    GOOGLE LOGIN
============================ */
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Google token verify 
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: crypto.randomBytes(16).toString("hex"), 
        role: "student",
        isVerified: true
      });
      await user.save();
    }

    // 3. JWT generate 
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "10m" }
    );

    res.status(200).json({
      message: "Google Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture
      },
    });
  } catch (error) {
    console.error("Google Login error:", error.message);
    res.status(400).json({ message: "Google Authentication failed" });
  }
};

/* ============================
    FORGOT PASSWORD
============================ */
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = `Aapne password reset request ki hai. Link: ${resetUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: "SettleIn Password Reset",
      text: message,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error); 
    res.status(500).json({ message: "Email could not be sent" });
  }
};

/* ============================
    RESET PASSWORD
============================ */
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // FIXED: Added 'user.' prefix to fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Reset failed" });
  }
};

/* ============================
    REGISTER USER
============================ */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //  ADMIN LIMIT CHECK
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });

      if (existingAdmin) {
        return res.status(403).json({
          message: "Only one admin allowed in system"
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "student"
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name, email, role: user.role },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

/* ============================
    LOGIN USER
============================ */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "10m" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};