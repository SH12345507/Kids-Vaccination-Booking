import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ParentShared.css";
import "./ChangePassword.css";
import Footer from "../../../components/Footer/Footer";
import ParentLayout from "../../../Components/ParentLayout/ParentLayout";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/parent/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setPasswordError(result.message || "Something went wrong.");
        return;
      }

      setSavedMsg("Password changed successfully.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSavedMsg(""), 3000);

    } catch (error) {
      setPasswordError("Server error. Please try again.");
    }
  };

  return (
    <ParentLayout topbarTitle="Change Password">
      <div className="settings-subpage-wrapper">
        <div className="form-card">
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="field-label">Current Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type={showCurrentPass ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  required
                />
                <span className="toggle-password" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                  {showCurrentPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">New Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type={showNewPass ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <span className="toggle-password" onClick={() => setShowNewPass(!showNewPass)}>
                  {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
              <p className="hint-text">Must be at least 8 characters.</p>
            </div>

            <div className="form-group">
              <label className="field-label">Confirm New Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={passwordError ? "input-error" : ""}
                />
              </div>
              {passwordError && <p className="error-text">{passwordError}</p>}
            </div>

            <div className="settings-save-row">
              <button type="submit" className="btn-primary">Update Password</button>
            </div>

            {savedMsg && (
              <p className="save-success"><CheckCircle2 size={16} /> {savedMsg}</p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </ParentLayout>
  );
};

export default ChangePassword;