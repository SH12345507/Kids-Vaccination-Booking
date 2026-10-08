const express = require("express");
const router = express.Router();
const { protect, hospitalOnly, parentOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
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
   getDashboardStats,
} = require("../controllers/hospitalController");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("certificate"), updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/profile", protect, deleteAccount);

// ===== PUBLIC (parent-facing) =====
// ✅ Approved hospitals only, filterable by type — used by AddChild dropdown
router.get("/public", protect, getPublicHospitals);
// ✅ Full profile (name, address, phone, charges, ratings) for the "view" icon
router.get("/public/profile/:hospitalId", protect, getPublicHospitalProfile);
// ✅ Parent submits/updates their rating for a hospital
router.post("/public/:hospitalId/rate", protect, parentOnly, rateHospital);

// ✅ Hospital views its OWN ratings (with reviewer name populated)
router.get("/ratings", protect, hospitalOnly, getMyRatings);

// ===== STOCK =====
router.get("/stock", protect, hospitalOnly, getMyStock);
router.post("/stock", protect, hospitalOnly, addStockItem);
router.put("/stock/:stockId", protect, hospitalOnly, updateStockItem);
router.delete("/stock/:stockId", protect, hospitalOnly, deleteStockItem);
router.get("/stock/public/:hospitalId", protect, getPublicStock);

// ===== SLOTS =====
// ✅ Only the logged-in HOSPITAL can manage its own slots
router.get("/slots", protect, hospitalOnly, getMySlots);
router.post("/slots", protect, hospitalOnly, addSlot);
router.put("/slots/:slotId", protect, hospitalOnly, updateSlot);
router.delete("/slots/:slotId", protect, hospitalOnly, deleteSlot);

// ✅ Read-only — any logged-in user (parent/admin/hospital) can view a hospital's slots
router.get("/slots/public/:hospitalId", protect, getPublicSlots);

// ✅ Booking — any logged-in user (will be used by the parent booking flow).
// Automatically increases bookedSlots (i.e. reduces availability).
router.put("/slots/public/:hospitalId/:slotId/book", protect, bookSlot);
router.put("/slots/public/:hospitalId/:slotId/cancel", protect, cancelSlotBooking);

router.get("/children-requests", protect, getChildrenRequests);
router.put("/children-requests/:childId/approve", protect, hospitalOnly, approveChildRequest);
router.put("/children-requests/:childId/reject", protect, hospitalOnly, rejectChildRequest);
router.put("/children-requests/:childId/revert", protect, hospitalOnly, revertChildRequest);
router.put(
  "/children-requests/:childId/schedule/:scheduleItemId/mark-given",
  protect,
  hospitalOnly,
  markVaccineGiven
);
router.put(
  "/children-requests/:childId/schedule/:scheduleItemId/undo",
  protect,
  hospitalOnly,
  undoVaccineGiven
);
router.put(
  "/children-requests/:childId/schedule/:scheduleItemId/set-date",
  protect,
  hospitalOnly,
  setVaccineDueDate
);
router.get("/dashboard-stats", protect, getDashboardStats);
module.exports = router;