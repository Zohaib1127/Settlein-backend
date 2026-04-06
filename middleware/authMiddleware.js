import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * AUTH MIDDLEWARE (PROTECT)
 * Ensures the user is authenticated by verifying the JWT token.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from the Authorization header (Bearer token pattern)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify the validity of the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user from Database (excluding sensitive password field)
    const user = await User.findById(decoded.id).select("-password");

    // Ensure the user still exists in the database
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Attach the user object to the request for use in following routes
    req.user = user;
    next();

  } catch (error) {
    // Log error to terminal for backend debugging
    console.error("🔴 Auth Middleware Error:", error.message);

    // Specific handling for expired tokens to trigger frontend logout logic
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // General error for malformed or invalid tokens
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * ADMIN MIDDLEWARE
 * Restricts access to routes based on the user's role.
 * Note: Must be used AFTER the 'protect' middleware.
 */
export const admin = (req, res, next) => {
  try {
    // Check if user exists and has the 'admin' role
    if (req.user && req.user.role === "admin") {
      return next();
    }

    // Forbidden access if not an admin
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });

  } catch (error) {
    console.error("🔴 Admin Middleware Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error in admin check",
    });
  }
};