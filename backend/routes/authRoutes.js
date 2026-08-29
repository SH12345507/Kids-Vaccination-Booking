const express = require("express");
const router = express.Router();
const {
  parentSignup,
  hospitalSignup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

router.post("/parent-signup", parentSignup);
router.post("/hospital-signup", upload.single("certificate"), hospitalSignup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;