import express from "express";
const router = express.Router();
import { getAdminProfile, updateAdminProfile } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// GET profile data
router.get("/profile", protect, admin, getAdminProfile);

// PUT update profile data
router.put("/update", protect, admin, updateAdminProfile);

export default router;