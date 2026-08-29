const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: "parent" },
  resetToken: { type: String },
  resetExpiry: { type: Date },
  notificationPrefs: {
    vaccineReminders: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false }, // ✅ SMS is opt-in (costs money to send)
  },
}, { timestamps: true });

module.exports = mongoose.model("Parent", parentSchema);
