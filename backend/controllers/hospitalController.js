const Hospital = require("../models/Hospital");
const Child = require("../models/Child");
const Vaccine = require("../models/Vaccine");
const bcrypt = require("bcryptjs");
const sendNotification = require("../utils/sendNotification");

// ===== GET HOSPITAL PROFILE =====
const getProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select("-password");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE HOSPITAL PROFILE =====
// Handles: name, phone, address, type, fees, and (optionally) a replaced certificate file
const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, address, type,
      hospitalVisitCharges, homeVisitCharges,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (type !== undefined) updateData.type = type;
    if (hospitalVisitCharges !== undefined) updateData.hospitalVisitCharges = Number(hospitalVisitCharges) || 0;
    if (homeVisitCharges !== undefined) updateData.homeVisitCharges = Number(homeVisitCharges) || 0;

    // ✅ If a new certificate file was uploaded, replace the stored path
    if (req.file) {
      updateData.certificate = `/uploads/certificates/${req.file.filename}`;
    }

    // ✅ Government hospitals never charge fees
    if (updateData.type === "Government") {
      updateData.hospitalVisitCharges = 0;
      updateData.homeVisitCharges = 0;
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: "after" }
    ).select("-password");

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    res.status(200).json({ message: "Profile updated", hospital });
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

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const isMatch = await bcrypt.compare(currentPassword, hospital.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    hospital.password = await bcrypt.hash(newPassword, 10);
    await hospital.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE ACCOUNT =====
const deleteAccount = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET MY STOCK (Hospital's own — for Manage Stock page) =====
const getMyStock = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select("stock");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json(hospital.stock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== ADD STOCK ITEM (only into the logged-in hospital's own record) =====
const addStockItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: "Vaccine name and quantity are required" });
    }

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    hospital.stock.push({ name, quantity: Number(quantity) });
    await hospital.save();

    if (Number(quantity) <= 0) {
      await sendNotification({
        recipientId: hospital._id,
        role: "hospital",
        title: "Vaccine Out of Stock",
        message: `${name} is out of stock.`,
        user: hospital,
      });
    }

    res.status(201).json({ message: "Vaccine added", stock: hospital.stock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE STOCK ITEM (only within the logged-in hospital's own record) =====
const updateStockItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const item = hospital.stock.id(req.params.stockId);
    if (!item) return res.status(404).json({ message: "Stock item not found" });

    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = Number(quantity);

    await hospital.save();

    if (item.quantity <= 0) {
      await sendNotification({
        recipientId: hospital._id,
        role: "hospital",
        title: "Vaccine Out of Stock",
        message: `${item.name} is out of stock.`,
        user: hospital,
      });
    }

    res.status(200).json({ message: "Vaccine updated", stock: hospital.stock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE STOCK ITEM (only within the logged-in hospital's own record) =====
const deleteStockItem = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const item = hospital.stock.id(req.params.stockId);
    if (!item) return res.status(404).json({ message: "Stock item not found" });

    item.deleteOne();
    await hospital.save();

    res.status(200).json({ message: "Vaccine removed", stock: hospital.stock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== VIEW ANY HOSPITAL'S STOCK (read-only — any logged-in user: parent/admin/hospital) =====
const getPublicStock = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).select("name stock");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json({ hospitalName: hospital.name, stock: hospital.stock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET MY SLOTS (Hospital's own — for Manage Slots page) =====
const getMySlots = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select("slots");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json(hospital.slots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== ADD SLOT(S) — one entry per selected day, only into own record =====
const addSlot = async (req, res) => {
  try {
    const { days, timeFrom, timeTo, totalSlots, type } = req.body;

    if (!days || !days.length || !timeFrom || !timeTo || !totalSlots) {
      return res.status(400).json({ message: "Days, time range and total slots are required" });
    }

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    days.forEach((day) => {
      hospital.slots.push({
        day,
        timeFrom,
        timeTo,
        totalSlots: Number(totalSlots),
        bookedSlots: 0,
        type: type || "Hospital",
      });
    });

    await hospital.save();
    res.status(201).json({ message: "Slot(s) added", slots: hospital.slots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE SLOT (only within own record) =====
const updateSlot = async (req, res) => {
  try {
    const { day, timeFrom, timeTo, totalSlots, type } = req.body;

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const slot = hospital.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (day !== undefined) slot.day = day;
    if (timeFrom !== undefined) slot.timeFrom = timeFrom;
    if (timeTo !== undefined) slot.timeTo = timeTo;
    if (type !== undefined) slot.type = type;
    if (totalSlots !== undefined) {
      // ✅ never let the new total drop below how many are already booked
      if (Number(totalSlots) < slot.bookedSlots) {
        return res.status(400).json({
          message: `Total slots can't be less than already booked slots (${slot.bookedSlots}).`,
        });
      }
      slot.totalSlots = Number(totalSlots);
    }

    await hospital.save();

    if (slot.bookedSlots >= slot.totalSlots && slot.totalSlots > 0) {
      await sendNotification({
        recipientId: hospital._id,
        role: "hospital",
        title: "Slot Fully Booked",
        message: `Your ${slot.day} ${slot.timeFrom}-${slot.timeTo} slot is now fully booked.`,
        user: hospital,
      });
    }

    res.status(200).json({ message: "Slot updated", slots: hospital.slots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE SLOT (only within own record) =====
const deleteSlot = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const slot = hospital.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.deleteOne();
    await hospital.save();

    res.status(200).json({ message: "Slot removed", slots: hospital.slots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== VIEW ANY HOSPITAL'S SLOTS (read-only — any logged-in user) =====
const getPublicSlots = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).select("name slots");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json({ hospitalName: hospital.name, slots: hospital.slots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET APPROVED HOSPITALS FOR PARENT DROPDOWN (filtered by type) =====
// GET /api/hospital/public?type=Private  or  ?type=Government
const getPublicHospitals = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isApproved: true };
    if (type) filter.type = type;

    const hospitals = await Hospital.find(filter).select(
      "name type address phone visitType hospitalVisitCharges homeVisitCharges ratings"
    );
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET SINGLE HOSPITAL PROFILE (name, address, phone, charges, ratings) =====
// GET /api/hospital/public/profile/:hospitalId
const getPublicHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).select("-password");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== RATE A HOSPITAL (any logged-in parent) =====
// POST /api/hospital/public/:hospitalId/rate  { rating, comment }
const rateHospital = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // ✅ one rating per parent — update it if they've already rated this hospital
    const existing = hospital.ratings.find((r) => r.parent.toString() === req.user.id);
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
    } else {
      hospital.ratings.push({ parent: req.user.id, rating, comment: comment || "" });
    }

    // ✅ recalculate the average whenever ratings change
    const total = hospital.ratings.reduce((sum, r) => sum + r.rating, 0);
    hospital.averageRating = hospital.ratings.length
      ? Number((total / hospital.ratings.length).toFixed(1))
      : 0;

    await hospital.save();

    // ✅ let the hospital know they received a new/updated rating
    await sendNotification({
      recipientId: hospital._id,
      role: "hospital",
      title: "New Rating Received",
      message: `A parent rated your hospital ${rating} star${rating > 1 ? "s" : ""}.${
        comment ? ` They wrote: "${comment}"` : ""
      }`,
      user: hospital,
    });

    res.status(200).json({ message: "Rating submitted", averageRating: hospital.averageRating });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== BOOK A SLOT (increases bookedSlots by 1 — used when a parent books an appointment) =====
// Any logged-in user can call this (parent booking flow will use it once that page is built).
const bookSlot = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const slot = hospital.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.bookedSlots >= slot.totalSlots) {
      return res.status(400).json({ message: "This slot is already full." });
    }

    slot.bookedSlots += 1; // ✅ automatically decreases availability
    await hospital.save();

    if (slot.bookedSlots >= slot.totalSlots) {
      await sendNotification({
        recipientId: hospital._id,
        role: "hospital",
        title: "Slot Fully Booked",
        message: `Your ${slot.day} ${slot.timeFrom}-${slot.timeTo} slot is now fully booked.`,
        user: hospital,
      });
    }

    res.status(200).json({ message: "Slot booked", slot });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== CANCEL A BOOKING (decreases bookedSlots by 1 — for future cancellation flow) =====
const cancelSlotBooking = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const slot = hospital.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.bookedSlots > 0) slot.bookedSlots -= 1;
    await hospital.save();

    res.status(200).json({ message: "Booking cancelled", slot });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET MY RATINGS (Hospital's own — for View Rating page) =====
// Returns ratings with the reviewing parent's name populated
const getMyRatings = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id)
      .select("ratings averageRating")
      .populate("ratings.parent", "name email");

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    res.status(200).json({
      averageRating: hospital.averageRating,
      ratings: hospital.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET CHILDREN REQUESTS =====
const getChildrenRequests = async (req, res) => {
  try {
    const children = await Child.find({ hospital: req.user.id })
      .populate("parent", "name email phone")
      .populate("schedule.vaccine", "name ageLabel");
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== APPROVE A CHILD REQUEST (only if it belongs to this hospital) =====
const approveChildRequest = async (req, res) => {
  try {
    const child = await Child.findOneAndUpdate(
      { _id: req.params.childId, hospital: req.user.id },
      { status: "Approved" },
      { returnDocument: "after" }
    )
      .populate("parent", "name email phone")
      .populate("schedule.vaccine", "name ageLabel");
    if (!child) return res.status(404).json({ message: "Request not found" });

    // ✅ let the parent know their child's request was approved
    if (child.parent?._id) {
      await sendNotification({
        recipientId: child.parent._id,
        role: "parent",
        title: "Registration Approved",
        message: `${child.childName}'s registration has been approved. You can now track their vaccination schedule.`,
        smsEligible: true,
      });
    }

    res.status(200).json({ message: "Request approved", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== REJECT A CHILD REQUEST (only if it belongs to this hospital) =====
const rejectChildRequest = async (req, res) => {
  try {
    const child = await Child.findOneAndUpdate(
      { _id: req.params.childId, hospital: req.user.id },
      { status: "Rejected" },
      { returnDocument: "after" }
    )
      .populate("parent", "name email phone")
      .populate("schedule.vaccine", "name ageLabel");
    if (!child) return res.status(404).json({ message: "Request not found" });

    // ✅ let the parent know their child's request was rejected
    if (child.parent?._id) {
      await sendNotification({
        recipientId: child.parent._id,
        role: "parent",
        title: "Registration Rejected",
        message: `${child.childName}'s registration request was not approved. Please contact the hospital for more details.`,
      });
    }

    res.status(200).json({ message: "Request rejected", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== REVERT A REQUEST BACK TO PENDING (Undo button) =====
const revertChildRequest = async (req, res) => {
  try {
    const child = await Child.findOneAndUpdate(
      { _id: req.params.childId, hospital: req.user.id },
      { status: "Pending" },
      { returnDocument: "after" }
    )
      .populate("parent", "name email phone")
      .populate("schedule.vaccine", "name ageLabel");
    if (!child) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request reverted to pending", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== MARK A SINGLE VACCINE AS GIVEN (also reduces matching stock by 1) =====
const markVaccineGiven = async (req, res) => {
  try {
    const { childId, scheduleItemId } = req.params;

    const child = await Child.findOne({ _id: childId, hospital: req.user.id });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const item = child.schedule.id(scheduleItemId);
    if (!item) return res.status(404).json({ message: "Vaccine schedule item not found" });

    if (!item.dueDate) {
      return res.status(400).json({
        message: "Please set this vaccine's date before marking it as given.",
      });
    }

    // ✅ reduce hospital stock for this vaccine, if tracked
    const vaccine = await Vaccine.findById(item.vaccine);
    if (vaccine) {
      const hospital = await Hospital.findById(req.user.id);
      const stockItem = hospital.stock.find(
        (s) => s.name.toLowerCase() === vaccine.name.toLowerCase()
      );
      if (stockItem) {
        if (stockItem.quantity <= 0) {
          return res.status(400).json({
            message: `No stock left for ${vaccine.name}. Cannot mark as given.`,
          });
        }
        stockItem.quantity -= 1;
        await hospital.save();

        if (stockItem.quantity <= 0) {
          await sendNotification({
            recipientId: hospital._id,
            role: "hospital",
            title: "Vaccine Out of Stock",
            message: `${stockItem.name} is out of stock.`,
            user: hospital,
          });
        }
      }
    }

    item.status = "Completed";
    item.completedDate = new Date();

    // ✅ if every vaccine in the child's schedule is completed, mark the whole schedule complete
    child.scheduleCompleted = child.schedule.every((s) => s.status === "Completed");

    await child.save();
    // ✅ re-populate — a plain .save() does NOT keep populated fields, so without
    // this the vaccine names and parent phone would come back empty on the frontend
    await child.populate([
      { path: "parent", select: "name email phone" },
      { path: "schedule.vaccine", select: "name ageLabel" },
    ]);

    res.status(200).json({ message: "Vaccine marked as given", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UNDO A "GIVEN" VACCINE (reverts to Pending, restores stock by 1) =====
const undoVaccineGiven = async (req, res) => {
  try {
    const { childId, scheduleItemId } = req.params;

    const child = await Child.findOne({ _id: childId, hospital: req.user.id });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const item = child.schedule.id(scheduleItemId);
    if (!item) return res.status(404).json({ message: "Vaccine schedule item not found" });

    // ✅ restore stock if it was reduced
    const vaccine = await Vaccine.findById(item.vaccine);
    if (vaccine) {
      const hospital = await Hospital.findById(req.user.id);
      const stockItem = hospital.stock.find(
        (s) => s.name.toLowerCase() === vaccine.name.toLowerCase()
      );
      if (stockItem) {
        stockItem.quantity += 1;
        await hospital.save();
      }
    }

    item.status = "Pending";
    item.completedDate = undefined;
    child.scheduleCompleted = false;

    await child.save();
    await child.populate([
      { path: "parent", select: "name email phone" },
      { path: "schedule.vaccine", select: "name ageLabel" },
    ]);

    res.status(200).json({ message: "Reverted to pending", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== MANUALLY SET A VACCINE'S DUE DATE (hospital enters it themselves) =====
const setVaccineDueDate = async (req, res) => {
  try {
    const { childId, scheduleItemId } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    const child = await Child.findOne({ _id: childId, hospital: req.user.id });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const item = child.schedule.id(scheduleItemId);
    if (!item) return res.status(404).json({ message: "Vaccine schedule item not found" });

    item.dueDate = new Date(dueDate);

    await child.save();
    await child.populate([
      { path: "parent", select: "name email phone" },
      { path: "schedule.vaccine", select: "name ageLabel" },
    ]);

    // ✅ let the parent know their child's next vaccine date has been set
    if (child.parent?._id) {
      const vaccineName = item.vaccine?.name || "The next vaccine";
      await sendNotification({
        recipientId: child.parent._id,
        role: "parent",
        title: "Vaccine Date Set",
        message: `${child.childName}'s ${vaccineName} is now scheduled for ${new Date(
          dueDate
        ).toLocaleDateString()}.`,
        smsEligible: true,
      });
    }

    res.status(200).json({ message: "Due date saved", child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getMyStock,
  addStockItem,
  updateStockItem,
  deleteStockItem,
  getPublicStock,
  getMySlots,
  addSlot,
  updateSlot,
  deleteSlot,
  getPublicSlots,
  getPublicHospitals,
  getPublicHospitalProfile,
  rateHospital,
  getMyRatings,
  bookSlot,
  cancelSlotBooking,
  getChildrenRequests,
  approveChildRequest,
  rejectChildRequest,
  revertChildRequest,
  markVaccineGiven,
  undoVaccineGiven,
  setVaccineDueDate,
};