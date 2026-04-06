import express from "express";
import { getContacts, createAlert } from "../controllers/emergencyController.js";
import  {protect}  from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/contacts", getContacts);
router.post("/alert", protect, createAlert);

export default router;