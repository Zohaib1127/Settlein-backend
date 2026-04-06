import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { forgotPassword, resetPassword, googleLogin } from "../controllers/authController.js";


const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

export default router;
