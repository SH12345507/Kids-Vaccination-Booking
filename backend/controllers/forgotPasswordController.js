const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Parent = require("../models/Parent");
const Hospital = require("../models/Hospital");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ===== FORGOT PASSWORD =====
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Parent.findOne({ email });
    if (!user) user = await Hospital.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetExpiry = resetExpiry;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: '"KVB Support" <no-reply@kvb.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({ message: "Reset email sent successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== RESET PASSWORD =====
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let user = await Parent.findOne({
      resetToken: token,
      resetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      user = await Hospital.findOne({
        resetToken: token,
        resetExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { forgotPassword, resetPassword };