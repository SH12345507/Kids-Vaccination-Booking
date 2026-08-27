import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ASettings.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";
import {
  User, Bell, Lock,
  LogOut, Trash2, ChevronRight,
  X, AlertTriangle,
} from "lucide-react";

const ASettings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showLogoutModal, setShowLogoutModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError]             = useState("");

  const menuItems = [
    { id: "profile",       label: "Profile",          desc: "Edit your admin name and email",  icon: <User size={20} color="#2563eb" />, bg: "#e8f1fc", path: "/admin-settings/profile" },
    { id: "password",      label: "Change Password",  desc: "Update your account password",    icon: <Lock size={20} color="#b45309" />, bg: "#fdf0d5", path: "/admin-settings/password" },
    { id: "notifications", label: "Notifications",    desc: "Manage system alert preferences", icon: <Bell size={20} color="#475569" />, bg: "#eef1f4", path: "/admin-settings/notifications" },
  ];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  // ✅ Real backend call — DELETE /api/admin/profile
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setDeleteError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/profile", {
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
    <AdminLayout activeModule="settings" topbarTitle="Settings">

      <div className="settings-wrapper">
        <div className="settings-list form-card">

          {menuItems.map((item) => (
            <button key={item.id} className="settings-list-item" onClick={() => navigate(item.path)}>
              <div className="settings-list-icon" style={{ backgroundColor: item.bg }}>{item.icon}</div>
              <div className="settings-list-text">
                <h4>{item.label}</h4>
                <p>{item.desc}</p>
              </div>
              <ChevronRight size={20} className="settings-list-arrow" />
            </button>
          ))}

          {/* Logout */}
          <button className="settings-list-item settings-list-logout" onClick={() => setShowLogoutModal(true)}>
            <div className="settings-list-icon settings-logout-icon"><LogOut size={20} color="#ef4444" /></div>
            <div className="settings-list-text">
              <h4>Logout</h4>
              <p>Sign out of admin panel on this device</p>
            </div>
            <ChevronRight size={20} className="settings-list-arrow" />
          </button>

          {/* Delete Account */}
          <button className="settings-list-item settings-list-delete" onClick={() => setShowDeleteModal(true)}>
            <div className="settings-list-icon settings-delete-icon"><Trash2 size={20} color="#ef4444" /></div>
            <div className="settings-list-text">
              <h4>Delete Account</h4>
              <p>Permanently delete your admin account and all data</p>
            </div>
            <ChevronRight size={20} className="settings-list-arrow" />
          </button>

        </div>
      </div>

      <Footer />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogoutModal(false)}><X size={18} /></button>
            <div className="modal-icon"><LogOut size={28} color="#ef4444" /></div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of admin panel?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-danger-solid" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDeleteModal}><X size={18} /></button>
            <div className="modal-icon"><AlertTriangle size={28} color="#ef4444" /></div>
            <h3>Delete Account?</h3>
            <p>This action cannot be undone. All admin data will be permanently deleted.</p>
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

    </AdminLayout>
  );
};

export default ASettings;
