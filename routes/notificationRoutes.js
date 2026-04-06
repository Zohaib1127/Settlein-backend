import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  deleteNotification,
  clearNotifications
} from "../controllers/notificationController.js";

const router = express.Router();


router.get("/", protect, getNotifications);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, clearNotifications);

export default router;