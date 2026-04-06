import User from "../models/User.js";
import Document from "../models/Document.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import Announcement from "../models/Announcement.js"; 

/* ============================
    1. DASHBOARD OVERVIEW & STATS
============================ */
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents, 
      totalPartners, 
      pendingDocs, 
      totalListingsCount, 
      totalAnnouncements, 
      allUsers
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "housing_partner" }), 
      Document.countDocuments({ status: "pending" }),
      Listing.countDocuments().catch(() => 0),
      Announcement.countDocuments().catch(() => 0),
      User.find({ role: { $ne: "admin" } }) 
        .select("name email role createdAt isVerified")
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      users: totalStudents,
      partners: totalPartners, 
      docs: pendingDocs,
      listings: totalListingsCount,
      announcements: totalAnnouncements,
      allUsers: allUsers 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

/* ============================
    2. USER MANAGEMENT
============================ */
export const getAllUsers = async (req, res) => {
  try {
  
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const toggleUserVerify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = !user.isVerified;
    await user.save({ validateBeforeSave: false });

    if (user.isVerified) {
        await Notification.create({
            userId: user._id,
            title: "Account Verified! 🌟",
            message: "Admin has verified your account. Welcome to the platform!",
            type: "success",
            link: "/dashboard" 
        });
    }

    res.json({ message: "Status updated", isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: "Verification toggle failed" });
  }
};

/* ============================
    3. DOCUMENT MANAGEMENT
============================ */
export const getPendingDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: "pending" }).populate("user", "name email");
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents" });
  }
};

export const updateDocStatus = async (req, res) => {
  const { docId, status, feedback } = req.body;
  try {
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = status;
    doc.adminFeedback = feedback;
    await doc.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(doc.user, { isVerified: true });
    }

    const studentId = doc.user.toString();
    const newNotif = await Notification.create({
      userId: studentId,
      title: status === "approved" ? "Document Approved! ✅" : "Document Rejected! ❌",
      message: status === "approved" 
        ? `Your document '${doc.title}' has been approved.` 
        : `Your document '${doc.title}' was rejected. Reason: ${feedback}`,
      type: status === "approved" ? "success" : "alert",
      link: "/dashboard/documents", 
      createdAt: new Date()
    });

    if (global.io) {
      global.io.to(studentId).emit("newNotification", newNotif);
    }

    res.json({ message: `Document ${status} successfully!`, doc });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ============================
    4. ADMIN PROFILE
============================ */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (admin) {
      admin.name = req.body.name || admin.name;
      if (req.body.newPassword) admin.password = req.body.newPassword;
      await admin.save();
      res.json({ message: "Profile updated successfully!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ============================
    5. ADD NEW USER / PARTNER (ADMIN)
============================ */
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password, 
      role: role || "student", 
      isVerified: true 
    });

    await newUser.save();

    res.status(201).json({ 
      message: `${role === 'housing_partner' ? 'Housing Partner' : 'Student'} added successfully`, 
      user: newUser 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add user" });
  }
};