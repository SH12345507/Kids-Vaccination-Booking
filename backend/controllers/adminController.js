const Admin = require("../models/Admin");
const Hospital = require("../models/Hospital");
const Parent = require("../models/Parent");
const Child = require("../models/Child");
const bcrypt = require("bcryptjs");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");

// ===== GET ALL HOSPITALS =====
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("-password");
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ===== GET DASHBOARD STATS =====
const getDashboardStats = async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalParents = await Parent.countDocuments();

    const pendingRequests = await Child.countDocuments({
      status: "Pending",
    });

    const systemAlerts = 0;

    res.status(200).json({
      totalHospitals,
      totalParents,
      pendingRequests,
      systemAlerts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ===== APPROVE HOSPITAL =====
const approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.hospitalId,
      { isApproved: true },
      { returnDocument: "after" }
    );
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // ✅ sendNotification already handles BOTH the in-app bell-icon
    // notification AND the email (it checks notificationPrefs.emailAlerts
    // internally and sends via sendEmail itself) — approval isn't gated by
    // any specific category toggle, so no `category` is passed.
    // NOTE: don't also call sendEmail directly here — that was sending a
    // second, duplicate email on top of this one, which is what caused the
    // approval email to behave unreliably (two concurrent sends to the same
    // Gmail account in one request, one of which would sometimes get
    // silently dropped).
    await sendNotification({
      recipientId: hospital._id,
      role: "hospital",
      title: "Registration Approved",
      message:
        "Your hospital registration has been approved. You can now log in and start managing your services.",
      user: hospital,
    });

    res.status(200).json({ message: "Hospital approved", hospital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== REJECT HOSPITAL =====
const rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // ✅ An in-app notification would be pointless here (the account is
    // about to be deleted, so they'd never be able to log in and see it) —
    // so this sends only an email, and does it BEFORE deleting since the
    // hospital's saved email/preferences won't exist after that.
    const emailAllowed = hospital.notificationPrefs?.emailAlerts !== false;
    if (emailAllowed) {
      try {
        await sendEmail({
          to: hospital.email,
          subject: "Hospital Registration Update",
          html: `
            <p>Hi ${hospital.name},</p>
            <p>We're sorry to inform you that your hospital registration on KVB has been rejected by the admin.</p>
            <p>If you believe this was a mistake, please contact support or reach out to us for more details.</p>
          `,
        });
      } catch (err) {
        console.error("Failed to send rejection email:", err.message);
      }
    }

    await Hospital.findByIdAndDelete(req.params.hospitalId);
    res.status(200).json({ message: "Hospital rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL PARENTS =====
const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().select("-password");
    res.status(200).json(parents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL PARENTS WITH THEIR CHILDREN =====
const getAllParentsWithChildren = async (req, res) => {
  try {
    const parents = await Parent.find().select("-password").lean();

    const parentIds = parents.map((p) => p._id);
    const children = await Child.find({ parent: { $in: parentIds } })
      .populate("hospital", "name")
      .lean();

    // ✅ group children under their parent so the frontend gets one row per parent
    const childrenByParent = {};
    for (const child of children) {
      const key = child.parent.toString();
      if (!childrenByParent[key]) childrenByParent[key] = [];
      childrenByParent[key].push(child);
    }

    const parentsWithChildren = parents.map((parent) => ({
      ...parent,
      children: childrenByParent[parent._id.toString()] || [],
    }));

    res.status(200).json(parentsWithChildren);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE PARENT =====
const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // ✅ also remove this parent's children so they don't become orphaned records
    await Child.deleteMany({ parent: req.params.parentId });

    res.status(200).json({ message: "Parent and their children removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL RATINGS (ACROSS ALL HOSPITALS) =====
// ✅ UPDATED: now returns data in the exact shape ManageRatings.jsx expects
// (user + hospital as nested objects, `id`/`date` field names) instead of
// the old flat shape (parent/hospitalName/ratingId/createdAt) which caused
// "Cannot read properties of undefined (reading 'name')" on the frontend
// because it was reading r.user.name / r.hospital.name that didn't exist.
const getAllRatings = async (req, res) => {
  try {
    const hospitals = await Hospital.find(
      {},
      "name address type ratings"
    ).populate("ratings.parent", "name email phone");

    const allRatings = hospitals.flatMap((hospital) =>
      hospital.ratings.map((r) => ({
        id: r._id,
        hospitalId: hospital._id,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        user: {
          name: r.parent?.name || "Unknown",
          email: r.parent?.email || "",
          phone: r.parent?.phone || "",
        },
        hospital: {
          name: hospital.name,
          address: hospital.address,
          type: hospital.type,
        },
      }))
    );

    res.status(200).json(allRatings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE A RATING =====
const deleteRating = async (req, res) => {
  try {
    const { hospitalId, ratingId } = req.params;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const ratingExists = hospital.ratings.some(
      (r) => r._id.toString() === ratingId
    );
    if (!ratingExists) {
      return res.status(404).json({ message: "Rating not found" });
    }

    hospital.ratings = hospital.ratings.filter(
      (r) => r._id.toString() !== ratingId
    );

    // ✅ recalculate averageRating since a rating was removed
    hospital.averageRating = hospital.ratings.length
      ? hospital.ratings.reduce((sum, r) => sum + r.rating, 0) /
        hospital.ratings.length
      : 0;

    await hospital.save();

    res.status(200).json({ message: "Rating deleted", hospital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ADMIN PROFILE =====
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE ADMIN PROFILE =====
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body; // ✅ email is intentionally not editable (used for login)

    const updateData = {};
    if (name !== undefined) updateData.name = name;

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: "after" }
    ).select("-password");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Profile updated", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== CHANGE ADMIN PASSWORD =====
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE ADMIN ACCOUNT =====
const deleteAccount = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ message: "Admin account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};