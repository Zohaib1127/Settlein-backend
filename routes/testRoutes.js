import express from "express";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "✅ Access granted! Token verified successfully.",
    user: req.user
  });
});

export default router;
