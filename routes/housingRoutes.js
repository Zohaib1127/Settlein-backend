import express from "express";
import { 
  createListing, 
  getMyListings, 
  getAllListings, 
  updateListing, 
  deleteListing 
} from "../controllers/housingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js"; 

const router = express.Router();

// 1. Specific routes 
router.get("/my-listings", protect, getMyListings); 

// 2. Public route 
router.get("/", getAllListings);

// 3. Create listing 
router.post("/", protect, upload.array("images", 5), createListing);

// 4. Update listing 
router.put("/:id", protect, upload.array("images", 5), updateListing);

// 5. Delete listing
router.delete("/:id", protect, deleteListing);

export default router;