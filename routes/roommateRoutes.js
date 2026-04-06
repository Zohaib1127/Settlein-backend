import express from "express";
import {
  createOrUpdateProfile,
  getAllProfiles,
  getMatchingProfiles,
  handleMatchRequest, 
} from "../controllers/roommateController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrUpdateProfile);
router.get("/", protect, getAllProfiles);
router.get("/matches", protect, getMatchingProfiles);
router.post("/request", protect, handleMatchRequest);

export default router;