const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  childName: { type: String, required: true },
  guardianName: { type: String, required: true },
  guardianCnic: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  serviceType: { type: String, enum: ["private", "government"], default: "private" },
  requestType: { type: String, enum: ["home", "hospital"], default: "hospital" },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  slot: { type: mongoose.Schema.Types.ObjectId }, // ✅ _id of the entry inside hospital.slots that the parent booked
  autoSchedule: { type: Boolean, default: false },
  scheduleCompleted: { type: Boolean, default: false },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true },
  childPicture: { type: String, default: "" }, // Cloudinary URL
  birthCertificate: { type: String, default: "" }, // Cloudinary URL, optional
  schedule: [
    {
      vaccine: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine" },
      dueDate: { type: Date }, // hospital enters this manually, one at a time
      status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
      stockStatus: { type: String, enum: ["Available", "Out of Stock"], default: "Available" },
      completedDate: { type: Date }, // set when hospital marks this vaccine as given
    },
  ], // filled in automatically when autoSchedule is true
}, { timestamps: true });

module.exports = mongoose.model("Child", childSchema);