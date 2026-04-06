import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { chatWithAI } from "../controllers/chatController.js";
import { getMessages, sendMessage, markAsSeen } from "../controllers/chatController2.js"; // 👈 markAsSeen add kiya
import User from "../models/User.js";

const router = express.Router();

// 1. AI Chat Route
router.post("/ai", chatWithAI);

// 2. User-to-User Chat Routes
router.get("/:otherUserId", protect, getMessages); 
router.post("/send", protect, sendMessage);       

// 3. ✅ Seen Status Update 
router.put("/read/:senderId", protect, markAsSeen);

// 4. Get User Info 
router.get("/user/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;