import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminLayout.css";
import logo from "../../assets/logo.png";
import Notificationbell from "../Notificationbell/Notificationbell";
import { Hospital, Users, Star, Settings, LogOut, X, ShieldCheck, ArrowLeft } from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard",       icon: <ShieldCheck size={20} />, path: "/admin-dashboard" },
  { id: "hospitals", label: "Manage Hospitals", icon: <Hospital size={20} />,   path: "/admin-hospitals" },
  { id: "parents",   label: "Manage Parents",   icon: <Users size={20} />,      path: "/admin-parents" },
  { id: "ratings",   label: "View Ratings",     icon: <Star size={20} />,       path: "/admin-ratings" },
  { id: "settings",  label: "Settings",         icon: <Settings size={20} />,   path: "/admin-settings" },
];

const backRoutes = {
  "/admin-settings/profile":       { back: "/admin-settings" },
  "/admin-settings/notifications": { back: "/admin-settings" },
  "/admin-settings/password":      { back: "/admin-settings" },
};

// ✅ Shared admin data — lives right here, no separate file needed.
// AdminLayout fetches it ONCE; every page inside it (Profile, Settings, etc.)
// reads/updates the SAME data via the useAdmin() hook below.
const AdminDataContext = createContext(null);

export const useAdmin = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdmin must be used inside AdminLayout");
  }
  return ctx;
};

const AdminLayout = ({ activeModule, topbarTitle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Frontend guard — only a logged-in ADMIN can view these Pages.
  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Shared admin profile state =====
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState("");

  const fetchProfile = useCallback(async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setAdminError(result.message || "Failed to load admin profile.");
        return;
      }
      setAdmin(result);
    } catch (err) {
      setAdminError("Server error. Please try again later.");
    } finally {
      setAdminLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && role === "admin") fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  // ✅ One update function used by Profile page. After saving, it updates the
  // shared state so every page (and the topbar avatar) reflects it instantly.
  const updateProfile = async (fields) => {
    const response = await fetch("http://localhost:5000/api/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update profile.");
    }

    setAdmin(result.admin);
    return result.admin;
  };

  const isDashboard = location.pathname === "/admin-dashboard";
  const backInfo = backRoutes[location.pathname];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const avatarLetter = admin?.name ? admin.name.charAt(0).toUpperCase() : "A";

  return (
    <AdminDataContext.Provider
      value={{ admin, loading: adminLoading, error: adminError, fetchProfile, updateProfile }}
    >
      <div className="dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            <img src={logo} alt="KVB" style={{ width: 100, height: 100, objectFit: "contain" }} />
            <span style={{ fontSize: 20 }}>KVB</span>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button key={item.id}
                className={`sidebar-link ${activeModule === item.id ? "active" : ""}`}
                onClick={() => navigate(item.path)}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button className="sidebar-logout" onClick={() => setShowLogout(true)}>
            <LogOut size={20} /><span>Logout</span>
          </button>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {backInfo && (
                <button className="back-btn" onClick={() => navigate(backInfo.back)}>
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2>{topbarTitle}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isDashboard && <Notificationbell />}
              <div className="admin-avatar"
                onClick={() => navigate("/admin-settings")}
                style={{ cursor: "pointer" }}
                title={admin?.name || ""}>
                {avatarLetter}
              </div>
            </div>
          </header>
          {children}
        </div>

        {showLogout && (
          <div className="modal-overlay" onClick={() => setShowLogout(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowLogout(false)}><X size={18} /></button>
              <div className="modal-icon"><LogOut size={28} color="#ef4444" /></div>
              <h3>Log Out?</h3>
              <p>Are you sure you want to log out of admin panel?</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
                <button className="btn-danger-solid" onClick={confirmLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDataContext.Provider>
  );
};

export default AdminLayout;