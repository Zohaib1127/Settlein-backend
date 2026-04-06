import express from "express";
import { getChatByRequestId, saveMessage } from "../controllers/chatController3.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Request-based chat (GET)
router.get("/request/:requestId", protect, getChatByRequestId);

// 🔹 Request-based send message (POST)
router.post("/send-request", protect, saveMessage);

export default router;