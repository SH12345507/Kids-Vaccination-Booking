import React, { useState } from "react";
import "./AChangePassword.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";
import { Lock, Eye, EyeOff, Save } from "lucide-react";

const AChangePassword = () => {
  const token = localStorage.getItem("token");

  const [savedMsg, setSavedMsg]               = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [formData, setFormData]               = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      setSavedMsg("New password must be at least 8 characters!");
      setTimeout(() => setSavedMsg(""), 3000);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setSavedMsg("Passwords do not match!");
      setTimeout(() => setSavedMsg(""), 3000);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setSavedMsg(result.message || "Failed to change password.");
        setTimeout(() => setSavedMsg(""), 3000);
        setSaving(false);
        return;
      }

      setSavedMsg("Password updated successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setSavedMsg("Server error. Please try again later.");
      setTimeout(() => setSavedMsg(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeModule="settings" topbarTitle="Change Password">

      <div className="aprofile-wrapper">

        {savedMsg && (
          <div className={`save-success ${!savedMsg.includes("successfully") ? "save-error" : ""}`}>
            {savedMsg}
          </div>
        )}

        <div className="form-card aprofile-card">
          <form onSubmit={handleSave}>

            <div className="aprofile-section-title">
              <Lock size={18} color="#1e5f8e" /> Change Password
            </div>

            <div className="aprofile-field">
              <label className="aprofile-label">Current Password</label>
              <div className="aprofile-input-wrap">
                <Lock size={16} className="aprofile-icon" />
                <input type={showCurrent ? "text" : "password"} name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword} onChange={handleChange} required />
                <span className="aprofile-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>
            </div>

            <div className="aprofile-field">
              <label className="aprofile-label">New Password</label>
              <div className="aprofile-input-wrap">
                <Lock size={16} className="aprofile-icon" />
                <input type={showNew ? "text" : "password"} name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword} onChange={handleChange} required />
                <span className="aprofile-toggle" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>
            </div>

            <div className="aprofile-field">
              <label className="aprofile-label">Confirm New Password</label>
              <div className="aprofile-input-wrap">
                <Lock size={16} className="aprofile-icon" />
                <input type={showConfirm ? "text" : "password"} name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword} onChange={handleChange} required />
                <span className="aprofile-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>
            </div>

            <button type="submit" className="aprofile-save-btn" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Update Password"}
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </AdminLayout>
  );
};

export default AChangePassword;
