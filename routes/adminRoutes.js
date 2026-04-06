import express from "express";
const router = express.Router();
import { 
  getAdminStats, 
  getAllUsers, 
  getAdminProfile, 
  updateAdminProfile,
  getPendingDocuments, 
  updateDocStatus  ,
  deleteUser   
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { addUser } from "../controllers/adminController.js";
import { toggleUserVerify } from "../controllers/adminController.js";

// --- Dashboard Data Routes ---
router.get("/stats", protect, admin, getAdminStats);
router.get("/users", protect, admin, getAllUsers);

// --- Profile Management Routes ---
router.get("/profile", protect, admin, getAdminProfile);
router.put("/update", protect, admin, updateAdminProfile);
router.post("/users/add", protect, admin, addUser);
router.patch("/users/toggle-verify/:id", protect, admin, toggleUserVerify);

// --- 📄 DOCUMENT MANAGEMENT ROUTES ---
router.get("/documents/pending", protect, admin, getPendingDocuments);
router.patch("/documents/status", protect, admin, updateDocStatus); 
router.delete("/users/:id", protect, admin, deleteUser);

export default router;