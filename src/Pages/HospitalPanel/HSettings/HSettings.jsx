import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HSettings.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout, { useHospital } from "../../../Components/HospitalLayout/HospitalLayout";
import {
  User, Lock, Bell, CreditCard,
  LogOut, Trash2, ChevronRight,
  X, AlertTriangle,
} from "lucide-react";

// ✅ Outer component — just renders the layout (Provider lives inside HospitalLayout)
const HSettings = () => {
  return (
    <HospitalLayout activeModule="settings" topbarTitle="Settings">
      <HSettingsContent />
    </HospitalLayout>
  );
};

// ✅ Inner component — rendered as {children} INSIDE HospitalLayout, so it's a
// proper descendant of the Provider and useHospital() works correctly here.
const HSettingsContent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { hospital } = useHospital();

  const [showLogoutModal, setShowLogoutModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError]             = useState("");

  const hospitalType = hospital?.type || "Private";

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      desc: "Edit your hospital name, email and contact info",
      icon: <User size={20} color="#2563eb" />,
      bg: "#e8f1fc",
      path: "/hospital-settings/profile",
    },
    {
      id: "password",
      label: "Change Password",
      desc: "Update your account password",
      icon: <Lock size={20} color="#b45309" />,
      bg: "#fdf0d5",
      path: "/hospital-settings/password",
    },
    {
      id: "notifications",
      label: "Notifications",
      desc: "Manage reminders and alert preferences",
      icon: <Bell size={20} color="#475569" />,
      bg: "#eef1f4",
      path: "/hospital-settings/notifications",
    },
    ...(hospitalType === "Private" ? [{
      id: "payment",
      label: "Payment",
      desc: "Update your consultation fee",
      icon: <CreditCard size={20} color="#0d9488" />,
      bg: "#e0f5f3",
      path: "/hospital-settings/payment",
    }] : []),
  ];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setDeleteError("");
    try {
      const response = await fetch("http://localhost:5000/api/hospital/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setDeleteError(result.message || "Failed to delete account.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      sessionStorage.clear();
      setShowDeleteModal(false);
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError("Server error. Please try again later.");
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  return (
    <>
      <div className="settings-wrapper">
        <div className="settings-list form-card">

          {menuItems.map((item) => (
            <button key={item.id} className="settings-list-item"
              onClick={() => navigate(item.path)}>
              <div className="settings-list-icon" style={{ backgroundColor: item.bg }}>
                {item.icon}
              </div>
              <div className="settings-list-text">
                <h4>{item.label}</h4>
                <p>{item.desc}</p>
              </div>
              <ChevronRight size={20} className="settings-list-arrow" />
            </button>
          ))}

          <button className="settings-list-item settings-list-logout"
            onClick={() => setShowLogoutModal(true)}>
            <div className="settings-list-icon settings-logout-icon">
              <LogOut size={20} color="#ef4444" />
            </div>
            <div className="settings-list-text">
              <h4>Logout</h4>
              <p>Sign out of your account on this device</p>
            </div>
            <ChevronRight size={20} className="settings-list-arrow" />
          </button>

          <button className="settings-list-item settings-list-delete"
            onClick={() => setShowDeleteModal(true)}>
            <div className="settings-list-icon settings-delete-icon">
              <Trash2 size={20} color="#ef4444" />
            </div>
            <div className="settings-list-text">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data</p>
            </div>
            <ChevronRight size={20} className="settings-list-arrow" />
          </button>

        </div>
      </div>

      <Footer />

      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogoutModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon">
              <LogOut size={28} color="#ef4444" />
            </div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-danger-solid" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDeleteModal}>
              <X size={18} />
            </button>
            <div className="modal-icon">
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h3>Delete Account?</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <div className="delete-confirm-input">
              <label className="field-label">Type <strong>DELETE</strong> to confirm</label>
              <input type="text" className="delete-confirm-field"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE" />
            </div>
            {deleteError && <p className="cp-error">{deleteError}</p>}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn-danger-solid" onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE"}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HSettings;
