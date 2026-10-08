const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllHospitals,
  getDashboardStats,
  approveHospital,
  rejectHospital,
  getAllParents,
  getAllParentsWithChildren,
  deleteParent,
  getAllRatings,
  deleteRating,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/adminController");

router.get("/hospitals", protect, adminOnly, getAllHospitals);
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);
router.put("/approve-hospital/:hospitalId", protect, adminOnly, approveHospital);
router.delete("/reject-hospital/:hospitalId", protect, adminOnly, rejectHospital);

router.get("/parents", protect, adminOnly, getAllParents);
router.get("/parents-with-children", protect, adminOnly, getAllParentsWithChildren);
router.delete("/parents/:parentId", protect, adminOnly, deleteParent);

router.get("/ratings", protect, adminOnly, getAllRatings);
router.delete("/ratings/:hospitalId/:ratingId", protect, adminOnly, deleteRating);

router.get("/profile", protect, adminOnly, getProfile);
router.put("/profile", protect, adminOnly, updateProfile);
router.put("/change-password", protect, adminOnly, changePassword);
router.delete("/profile", protect, adminOnly, deleteAccount);

module.exports = router;