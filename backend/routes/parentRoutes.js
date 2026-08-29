const express = require("express");
const router = express.Router();
const { protect, parentOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  registerChild,
  getMyChildren,
  updateChild,
  deleteChild,
} = require("../controllers/parentController");

router.get("/profile", protect, parentOnly, getProfile);
router.put("/profile", protect, parentOnly, updateProfile);
router.put("/change-password", protect, parentOnly, changePassword);
router.delete("/profile", protect, parentOnly, deleteAccount);

router.post(
  "/register-child",
  protect,
  parentOnly,
  upload.fields([
    { name: "childPicture", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
  ]),
  registerChild
);
router.get("/my-children", protect, parentOnly, getMyChildren);

// ✅ birthCertificate is now editable from Manage Children — same multer
// pattern as register-child, but only for this one file field.
router.put(
  "/children/:childId",
  protect,
  parentOnly,
  upload.fields([{ name: "birthCertificate", maxCount: 1 }]),
  updateChild
);

router.delete("/children/:childId", protect, parentOnly, deleteChild);

module.exports = router;