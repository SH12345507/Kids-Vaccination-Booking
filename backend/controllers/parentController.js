const Parent = require("../models/Parent");
const Child = require("../models/Child");
const bcrypt = require("bcryptjs");
const generateSchedule = require("../utils/generateSchedule");
const sendNotification = require("../utils/sendNotification");

// ===== GET PARENT PROFILE =====
const getProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select("-password");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    res.status(200).json(parent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE PARENT PROFILE =====
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const parent = await Parent.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: "after" }
    ).select("-password");

    if (!parent) return res.status(404).json({ message: "Parent not found" });

    res.status(200).json({ message: "Profile updated", parent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== CHANGE PASSWORD =====
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const parent = await Parent.findById(req.user.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const isMatch = await bcrypt.compare(currentPassword, parent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    parent.password = await bcrypt.hash(newPassword, 10);
    await parent.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE ACCOUNT (also removes their children's records) =====
const deleteAccount = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.user.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    await Child.deleteMany({ parent: req.user.id }); // ✅ clean up their children too

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== REGISTER CHILD =====
const registerChild = async (req, res) => {
  try {
    const {
      childName, guardianName, guardianCnic,
      dateOfBirth, address, serviceType,
      requestType, hospital, autoSchedule, startVaccine,
    } = req.body;

    const isAutoSchedule = autoSchedule === "true" || autoSchedule === true;

    // ✅ multer (Cloudinary storage) puts uploaded files on req.files
    const childPicture = req.files?.childPicture?.[0]?.path || "";
    const birthCertificate = req.files?.birthCertificate?.[0]?.path || "";

    // ✅ Build the vaccine schedule from the Vaccine collection.
    // Passing `hospital` lets stockStatus reflect this hospital's real stock
    // (previously this was missing, so stockStatus was never accurate).
    // `startVaccine` lets the schedule begin partway through if the child has
    // already received earlier doses elsewhere.
    // - autoSchedule ON  → full schedule starting from startVaccine (or birth).
    // - autoSchedule OFF but a vaccine was picked → schedule with just that one vaccine.
    // - autoSchedule OFF and no vaccine picked → no schedule at all.
    let schedule = [];
    if (isAutoSchedule) {
      schedule = await generateSchedule(dateOfBirth, hospital, startVaccine);
    } else if (startVaccine) {
      schedule = await generateSchedule(dateOfBirth, hospital, startVaccine, true);
    }

    const child = await Child.create({
      childName, guardianName, guardianCnic,
      dateOfBirth, address, serviceType,
      requestType, hospital,
      autoSchedule: isAutoSchedule,
      childPicture,
      birthCertificate,
      schedule,
      parent: req.user.id,
    });

    // ✅ notify the hospital the parent selected, so they see it in their
    // pending requests (Manage Schedule / View Appointments)
    if (hospital) {
      await sendNotification({
        recipientId: hospital,
        role: "hospital",
        title: "New Child Registration",
        message: `${childName} has been registered by a parent and is awaiting your approval.`,
      });
    }

    res.status(201).json({ message: "Child registered successfully", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET MY CHILDREN =====
const getMyChildren = async (req, res) => {
  try {
    const children = await Child.find({ parent: req.user.id })
      .populate(
        "hospital",
        "name email phone address type hospitalVisitCharges homeVisitCharges averageRating ratings"
      )
      .populate("schedule.vaccine", "name ageLabel");
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE A CHILD (only if it belongs to the logged-in parent) =====
const updateChild = async (req, res) => {
  try {
    const { childName, dateOfBirth, address } = req.body;

    const updateData = {};
    if (childName !== undefined) updateData.childName = childName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateData.address = address;

    // ✅ Only overwrite birthCertificate if a new file was actually uploaded —
    // otherwise leave the existing one untouched (edit form may be submitted
    // with no new file selected).
    const newCertificate = req.files?.birthCertificate?.[0]?.path;
    if (newCertificate) updateData.birthCertificate = newCertificate;

    // ✅ Ownership check baked into the query itself — a parent can only
    // ever match/update a child document that is their own.
    const child = await Child.findOneAndUpdate(
      { _id: req.params.childId, parent: req.user.id },
      updateData,
      { returnDocument: "after" }
    );

    if (!child) {
      return res.status(404).json({ message: "Child not found or not yours to edit" });
    }

    res.status(200).json({ message: "Child updated", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE A CHILD (only if it belongs to the logged-in parent) =====
const deleteChild = async (req, res) => {
  try {
    const child = await Child.findOneAndDelete({
      _id: req.params.childId,
      parent: req.user.id,
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found or not yours to delete" });
    }

    res.status(200).json({ message: "Child removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  registerChild,
  getMyChildren,
  updateChild,
  deleteChild,
};