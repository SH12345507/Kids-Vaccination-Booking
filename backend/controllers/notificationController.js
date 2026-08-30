const Notification = require("../models/Notification");
const Parent = require("../models/Parent");
const Hospital = require("../models/Hospital");
const Admin = require("../models/Admin");

const roleModelMap = { parent: Parent, hospital: Hospital, admin: Admin };

// ===== GET MY NOTIFICATIONS (whichever role is logged in) =====
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      role: req.user.role,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== MARK ALL AS READ =====
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, role: req.user.role, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET NOTIFICATION PREFERENCES =====
const getPreferences = async (req, res) => {
  try {
    const Model = roleModelMap[req.user.role];
    const user = await Model.findById(req.user.id).select("notificationPrefs");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.notificationPrefs || {});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE NOTIFICATION PREFERENCES =====
// Accepts any subset of toggle keys (e.g. { smsAlerts: true }) and merges
// them into whatever is already saved — this is what makes the Settings
// pages' individual toggle switches work without needing to resend everything.
const updatePreferences = async (req, res) => {
  try {
    const Model = roleModelMap[req.user.role];
    const user = await Model.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notificationPrefs = {
      ...(user.notificationPrefs?.toObject ? user.notificationPrefs.toObject() : user.notificationPrefs),
      ...req.body,
    };
    await user.save();

    res.status(200).json(user.notificationPrefs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMyNotifications, markAllRead, getPreferences, updatePreferences };
