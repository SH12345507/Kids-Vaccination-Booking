const mongoose = require("mongoose");

// ✅ Its own schema (with timestamps) so every rating gets a real date —
// needed for Admin's Manage Ratings page and Hospital's View Rating page.
const ratingSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
}, { timestamps: true });

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  type: { type: String, enum: ["Government", "Private"], default: "Private" },
  visitType: { type: String, enum: ["hospital", "home"], default: "hospital" },
  hospitalVisitCharges: { type: Number, default: 0 }, // ✅ new
  homeVisitCharges: { type: Number, default: 0 },      // ✅ new
  isApproved: { type: Boolean, default: false },
  role: { type: String, default: "hospital" },
  certificate: { type: String, default: "" },
  stock: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true, default: 0 },
    },
  ],
  slots: [
    {
      day: { type: String, required: true }, // Monday, Tuesday, ...
      timeFrom: { type: String, required: true },
      timeTo: { type: String, required: true },
      totalSlots: { type: Number, required: true, default: 0 },
      bookedSlots: { type: Number, default: 0 }, // ✅ increases automatically on booking
      type: { type: String, enum: ["Home", "Hospital"], default: "Hospital" },
    },
  ], // ✅ new — appointment slots
  resetToken: { type: String },
  resetExpiry: { type: Date },
  ratings: [ratingSchema], // ✅ one rating per parent, enforced in the controller
  averageRating: { type: Number, default: 0 }, // ✅ new — recalculated whenever ratings change
  notificationPrefs: {
    vaccineReminders: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false }, // ✅ SMS is opt-in (costs money to send)
  },
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);