import express from "express";
import { 
  sendRequest, 
  updateRequestStatus, 
  getListingRequests,
  getStudentRequests 
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendRequest);
router.get("/student", protect, getStudentRequests); 
router.get("/listing/:listingId", protect, getListingRequests);
router.put("/:id/status", protect , updateRequestStatus);

export default router;