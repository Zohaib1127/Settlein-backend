import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "admin", "housing_partner"],
    default: "student",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  /* 🔑 FORGOT PASSWORD FIELDS */
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Pre-save middleware: hash password before saving */
userSchema.pre("save", async function (next) {
  // Agar password change nahi hua, toh aage badho
  if (!this.isModified("password")) return next(); 
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* Method to compare passwords */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/*  Method to generate reset token (Logic move to model for cleanliness) */
userSchema.methods.getResetPasswordToken = function () {
  // Generate random string
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash it and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;