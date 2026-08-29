const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllVaccines,
  addVaccine,
  updateVaccine,
  deleteVaccine,
} = require("../controllers/vaccineController");

// ✅ Public — anyone can view vaccine info, no login required
router.get("/", getAllVaccines);

// ✅ Only admin manages the master vaccine list
router.post("/", protect, adminOnly, addVaccine);
router.put("/:vaccineId", protect, adminOnly, updateVaccine);
router.delete("/:vaccineId", protect, adminOnly, deleteVaccine);

module.exports = router;