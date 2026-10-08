const Parent = require("../models/Parent");
const Child = require("../models/Child");
const Hospital = require("../models/Hospital");
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

// ===== DELETE ACCOUNT (also removes their children's records and frees their slots) =====
const deleteAccount = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.user.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    // ✅ give every booked slot back before deleting the children
    const children = await Child.find({ parent: req.user.id });
    for (const c of children) {
      await releaseSlot(c.hospital, c.slot);
    }
    await Child.deleteMany({ parent: req.user.id });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== helper: give a booked slot back (bookedSlots - 1) =====
const releaseSlot = async (hospitalId, slotId) => {
  if (!hospitalId || !slotId) return;
  const hosp = await Hospital.findById(hospitalId);
  const slotDoc = hosp?.slots.id(slotId);
  if (slotDoc && slotDoc.bookedSlots > 0) {
    slotDoc.bookedSlots -= 1;
    await hosp.save();
  }
};

// ===== REGISTER CHILD =====
const registerChild = async (req, res) => {
  try {
    const {
      childName, guardianName, guardianCnic,
      dateOfBirth, address, serviceType,
      requestType, hospital, slot, autoSchedule, startVaccine,
    } = req.body;

    const isAutoSchedule = autoSchedule === "true" || autoSchedule === true;

    // ✅ multer (Cloudinary storage) puts uploaded files on req.files
    const childPicture = req.files?.childPicture?.[0]?.path || "";
    const birthCertificate = req.files?.birthCertificate?.[0]?.path || "";

    // ✅ SLOT BOOKING — validate hospital + slot, then book it (bookedSlots + 1)
    if (!hospital || !slot) {
      return res.status(400).json({ message: "Please select a hospital and a slot." });
    }

    const hosp = await Hospital.findById(hospital);
    if (!hosp) return res.status(404).json({ message: "Hospital not found" });

    const slotDoc = hosp.slots.id(slot);
    if (!slotDoc) return res.status(404).json({ message: "Slot not found" });

    // slot type must match the request type (home -> "Home", hospital -> "Hospital")
    const expectedType = requestType === "home" ? "Home" : "Hospital";
    if (slotDoc.type !== expectedType) {
      return res.status(400).json({
        message: `This slot is not available for ${requestType === "home" ? "home" : "hospital"} visits.`,
      });
    }

    if (slotDoc.bookedSlots >= slotDoc.totalSlots) {
      return res.status(400).json({ message: "This slot is already full. Please choose another." });
    }

    slotDoc.bookedSlots += 1; // ✅ this is what updates Booked / Avail on the hospital's Manage Slots page
    await hosp.save();

    // ✅ Build the vaccine schedule (see earlier notes: autoSchedule / startVaccine)
    let child;
    try {
      let schedule = [];
      if (isAutoSchedule) {
        schedule = await generateSchedule(dateOfBirth, hospital, startVaccine);
      } else if (startVaccine) {
        schedule = await generateSchedule(dateOfBirth, hospital, startVaccine, true);
      }

      child = await Child.create({
        childName, guardianName, guardianCnic,
        dateOfBirth, address, serviceType,
        requestType, hospital, slot,
        autoSchedule: isAutoSchedule,
        childPicture,
        birthCertificate,
        schedule,
        parent: req.user.id,
      });
    } catch (err) {
      // ✅ child could not be saved -> give the slot back so it isn't "booked" for nothing
      await releaseSlot(hospital, slot);
      throw err;
    }

    // ✅ tell the hospital when this booking filled the slot
    if (slotDoc.bookedSlots >= slotDoc.totalSlots) {
      await sendNotification({
        recipientId: hosp._id,
        role: "hospital",
        title: "Slot Fully Booked",
        message: `Your ${slotDoc.day} ${slotDoc.timeFrom}-${slotDoc.timeTo} slot is now fully booked.`,
        user: hosp,
      });
    }

    // ✅ notify the hospital so they see the new request
    await sendNotification({
      recipientId: hospital,
      role: "hospital",
      title: "New Child Registration",
      message: `${childName} has been registered by a parent and is awaiting your approval.`,
    });

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

    // ✅ Only overwrite birthCertificate if a new file was actually uploaded
    const newCertificate = req.files?.birthCertificate?.[0]?.path;
    if (newCertificate) updateData.birthCertificate = newCertificate;

    // ✅ Ownership check baked into the query itself
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

    // ✅ free the booked slot so it becomes available again
    await releaseSlot(child.hospital, child.slot);

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