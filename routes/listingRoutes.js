import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js"; 

const router = express.Router();

// 1. Public Routes 
router.get("/", getListings);
router.get("/:id", getListingById);

// 2. Protected Routes 
router.post("/", protect, upload.array("images", 5), createListing);
router.put("/:id", protect, upload.array("images", 5), updateListing);

// Delete listing
router.delete("/:id", protect, deleteListing);

export default router;