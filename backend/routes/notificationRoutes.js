const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAllRead,
  getPreferences,
  updatePreferences,
} = require("../controllers/notificationController");

// ✅ No role-specific middleware — works for parent, hospital, AND admin,
// since NotificationBell.jsx and the Settings Pages are used by all three.
router.get("/", protect, getMyNotifications);
router.put("/mark-all-read", protect, markAllRead);
router.get("/preferences", protect, getPreferences);
router.put("/preferences", protect, updatePreferences);

module.exports = router;