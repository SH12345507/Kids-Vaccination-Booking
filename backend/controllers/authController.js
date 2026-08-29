const Parent = require("../models/Parent");
const Hospital = require("../models/Hospital");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const sendNotification = require("../utils/sendNotification");

// ===== PARENT SIGNUP =====
const parentSignup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await Parent.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // ✅ notify every admin about the new parent registration
    const admins = await Admin.find();
    for (const admin of admins) {
      await sendNotification({
        recipientId: admin._id,
        role: "admin",
        title: "New Parent Registration",
        message: `${parent.name} has just created a parent account.`,
        user: admin,
      });
    }

    const token = jwt.sign(
      { id: parent._id, role: "parent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "Signup successful", token, role: "parent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== HOSPITAL SIGNUP =====
const hospitalSignup = async (req, res) => {
  try {
    const {
      name, email, password, phone, address, type,
      visitType, hospitalVisitCharges, homeVisitCharges,
    } = req.body;

    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Cloudinary gives back the full, permanent URL in req.file.path
    const certificatePath = req.file ? req.file.path : "";

    // ✅ Government hospitals are free — force charges to 0 regardless of input
    const isGovernment = type === "Government";

    const hospital = await Hospital.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      type,
      visitType,
      hospitalVisitCharges: isGovernment ? 0 : Number(hospitalVisitCharges) || 0,
      homeVisitCharges: isGovernment ? 0 : Number(homeVisitCharges) || 0,
      certificate: certificatePath,
    });

    // ✅ notify every admin — respects each admin's own "Hospital Requests" toggle
    const admins = await Admin.find();
    for (const admin of admins) {
      await sendNotification({
        recipientId: admin._id,
        role: "admin",
        title: "New Hospital Registration",
        message: `${hospital.name} has registered and is awaiting approval.`,
        category: "hospitalRequests",
        user: admin,
      });
    }

    res.status(201).json({ message: "Hospital registered, awaiting approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== LOGIN =====
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Parent.findOne({ email });
    let role = "parent";

    if (!user) {
      user = await Hospital.findOne({ email });
      role = "hospital";

      // ===== APPROVAL CHECK =====
      if (user && !user.isApproved) {
        return res.status(403).json({
          message: "Your hospital registration is pending admin approval. Please wait until your account is approved before logging in.",
          role: "hospital",
          pending: true,
        });
      }
    }

    if (!user) {
      user = await Admin.findOne({ email });
      role = "admin";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token, role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== helper — find a user by email across all three roles, auto-detecting role =====
const findUserByEmail = async (email) => {
  let user = await Parent.findOne({ email });
  if (user) return { user, role: "parent" };

  user = await Hospital.findOne({ email });
  if (user) return { user, role: "hospital" };

  user = await Admin.findOne({ email });
  if (user) return { user, role: "admin" };

  return { user: null, role: null };
};

// ===== FORGOT PASSWORD — email a 6-digit OTP code (no link, no frontend URL needed) =====
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ Auto-detect which account type this email belongs to — same
    // search order as login() — so the user never has to pick a role.
    const { user } = await findUserByEmail(email);

    // ✅ Same response whether the email exists or not — avoids leaking
    // which emails are registered.
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a code has been sent.",
      });
    }

    // ✅ 6-digit numeric OTP — easy to read/type from an email
    const otp = crypto.randomInt(100000, 999999).toString();
    // ✅ store only a hash of the OTP in the DB — the raw code (sent by
    // email) is never persisted, same principle as storing hashed passwords.
    // Reuses the existing resetToken/resetExpiry fields already on each model.
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetToken = hashedOtp;
    user.resetExpiry = Date.now() + 10 * 60 * 1000; // ✅ valid for 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your KVB password reset code",
      html: `
        <p>Hi ${user.name || ""},</p>
        <p>Your password reset code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>Enter this code in the app to reset your password. It expires in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.status(200).json({
      message: "If an account with that email exists, a code has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== VERIFY OTP — check the code without consuming it, so the frontend
// can move to the "set new password" step =====
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const { user } = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const isValid =
      user.resetToken === hashedOtp && user.resetExpiry > Date.now();

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== RESET PASSWORD — re-verify the OTP and set the new password =====
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Invalid reset request" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const { user } = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const isValid =
      user.resetToken === hashedOtp && user.resetExpiry > Date.now();

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  parentSignup,
  hospitalSignup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
};