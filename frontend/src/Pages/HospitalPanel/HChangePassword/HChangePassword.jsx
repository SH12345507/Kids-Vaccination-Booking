import React, { useState } from "react";
import "./HChangePassword.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import { Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from "lucide-react";

const HChangePassword = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ current: "", new: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleShow = (key) => setShow(s => ({ ...s, [key]: !s[key] }));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    if (!form.current) { setError("Please enter your current password."); return; }
    if (form.new.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (form.new !== form.confirm) { setError("Passwords do not match."); return; }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/hospital/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.current,
          newPassword: form.new,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to change password.");
        setSaving(false);
        return;
      }

      setForm({ current: "", new: "", confirm: "" });
      showToast("Password changed successfully.");
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "current", label: "Current Password",     placeholder: "Enter current password" },
    { key: "new",     label: "New Password",          placeholder: "Enter new password" },
    { key: "confirm", label: "Confirm New Password",  placeholder: "Re-enter new password" },
  ];

  return (
    <HospitalLayout activeModule="settings" topbarTitle="Change Password">

      <div className="settings-wrapper">
        <div className="form-card">

          {fields.map(({ key, label, placeholder }) => (
            <div className="sf-group" key={key}>
              <label className="sf-label">{label}</label>
              <div className="sf-input-wrap">
                <Lock size={16} className="sf-icon" />
                <input
                  className="sf-input"
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => field(key, e.target.value)}
                />
                <span className="toggle-pwd" onClick={() => toggleShow(key)}>
                  {show[key] ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>
            </div>
          ))}

          {error && (
            <p className="cp-error"><AlertCircle size={14} /> {error}</p>
          )}

          <div className="cp-actions">
            <button className="btn-save-sm" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Password"}
            </button>
          </div>

        </div>
      </div>

      <Footer />

      {toast && (
        <div className="settings-toast">
          <CheckCircle size={16} color="#0f6e56" /> {toast}
        </div>
      )}

    </HospitalLayout>
  );
};

export default HChangePassword;
