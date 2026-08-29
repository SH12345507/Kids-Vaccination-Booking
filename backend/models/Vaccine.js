const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "BCG", "Pentavalent 1"
  ageInDays: { type: Number, required: true }, // 0 = at birth, 42 = 6 weeks, etc.
  ageLabel: { type: String, required: true }, // "At Birth", "6 Weeks", "10 Weeks"
  description: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Vaccine", vaccineSchema);