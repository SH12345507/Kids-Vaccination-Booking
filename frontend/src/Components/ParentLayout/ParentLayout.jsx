import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ParentLayout.css";
import logo from "../../assets/logo.png";
import Notificationbell from "../Notificationbell/Notificationbell";
import {
  ShieldPlus, UserPlus, CalendarCheck,
  Settings as SettingsIcon, LogOut, X, ArrowLeft,
} from "lucide-react";

const menuItems = [
  { id: "overview", label: "Overview", icon: <ShieldPlus size={20} />, path: "/parent-dashboard" },
  { id: "add-child", label: "Add Child",                  icon: <UserPlus size={20} />,      path: "/add-child" },
  { id: "schedule",  label: "Vaccine Overview", icon: <CalendarCheck size={20} />, path: "/vaccine-schedule" },
  { id: "settings",  label: "Settings",                   icon: <SettingsIcon size={20} />,  path: "/settings" },
];

const backRoutes = {
  "/settings/profile":       { back: "/settings" },
  "/settings/password":      { back: "/settings" },
  "/settings/children":      { back: "/settings" },
  "/settings/notifications": { back: "/settings" },
};

// ✅ Shared parent data — lives right here, no separate file needed.
// ParentLayout fetches it ONCE; every page inside it (Profile, Settings, etc.)
// reads/updates the SAME data via the useParent() hook below.
const ParentDataContext = createContext(null);

export const useParent = () => {
  const ctx = useContext(ParentDataContext);
  if (!ctx) {
    throw new Error("useParent must be used inside ParentLayout");
  }
  return ctx;
};

const ParentLayout = ({ topbarTitle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Frontend guard — only a logged-in PARENT can view these pages.
  useEffect(() => {
    if (!token || role !== "parent") {
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Shared parent profile state =====
  const [parent, setParent] = useState(null);
  const [parentLoading, setParentLoading] = useState(true);
  const [parentError, setParentError] = useState("");

  const fetchProfile = useCallback(async () => {
    setParentLoading(true);
    setParentError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setParentError(result.message || "Failed to load profile.");
        return;
      }
      setParent(result);
    } catch (err) {
      setParentError("Server error. Please try again later.");
    } finally {
      setParentLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && role === "parent") fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  // ✅ One update function used by the Profile page. After saving, it updates
  // the shared state so every page (and the topbar avatar) reflects it instantly.
  const updateProfile = async (fields) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/profile`, {
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

    setParent(result.parent);
    return result.parent;
  };

  const isDashboard = location.pathname === "/parent-dashboard";
  const backInfo = backRoutes[location.pathname];

  // ✅ Fixed: was clearing "user" (a key that's never set) instead of "role"
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  const avatarLetter = parent?.name ? parent.name.charAt(0).toUpperCase() : "P";

  return (
    <ParentDataContext.Provider
      value={{ parent, loading: parentLoading, error: parentError, fetchProfile, updateProfile }}
    >
      <div className="dashboard-layout">

        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={logo} alt="KVB" style={{ width: 100, height: 100, objectFit: "contain" }} />
            <span style={{ fontSize: 22 }}>KVB</span>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button key={item.id}
                className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button className="sidebar-logout" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={20} />
            <span>Logout</span>
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
            <div className="topbar-right">
              {isDashboard && <Notificationbell />}
              <div className="user-avatar"
                onClick={() => navigate("/settings/profile")}
                style={{ cursor: "pointer" }}
                title={parent?.name || ""}>
                {avatarLetter}
              </div>
            </div>
          </header>

          {children}
        </div>

        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowLogoutModal(false)}>
                <X size={18} />
              </button>
              <div className="modal-icon"><LogOut size={28} color="#ef4444" /></div>
              <h3>Log Out?</h3>
              <p>Are you sure you want to log out of your account?</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                <button className="btn-danger-solid" onClick={confirmLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentDataContext.Provider>
  );
};

export default ParentLayout;