import User from "../models/User.js";
import bcrypt from "bcryptjs";


export const getAdminProfile = async (req, res) => {
  try {
    
    const admin = await User.findById(req.user._id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    
    res.json({
      name: admin.name,
      email: admin.email
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

  
    if (name) admin.name = name;

    if (newPassword) {
     
      if (currentPassword) {
        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
      }
      admin.password = newPassword; 
    }

    await admin.save();
    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};