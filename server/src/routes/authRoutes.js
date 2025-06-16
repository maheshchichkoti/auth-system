const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { uploadSingle, processImage } = require("../middleware/upload");
const {
  validateRegistration,
  validateLogin,
  validateOTP,
  handleValidationErrors,
} = require("../middleware/validation");

// Public routes
router.post(
  "/register",
  uploadSingle,
  processImage,
  validateRegistration,
  handleValidationErrors,
  authController.register
);

router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post(
  "/verify-otp",
  validateOTP,
  handleValidationErrors,
  authController.verifyOTP
);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.delete("/account", authenticateToken, authController.deleteAccount);

module.exports = router;
