import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HospitalLayout.css";
import logo from "../../assets/logo.png";
import Notificationbell from "../Notificationbell/Notificationbell";
import {
  CalendarDays, PackageOpen, ClipboardList,
  Settings, LogOut, Clock, Star, X, ShieldPlus, ArrowLeft,
} from "lucide-react";

const menuItems = [
  { id: "overview",     label: "Dashboard",         icon: <ShieldPlus size={20} />,    path: "/hospital-dashboard" },
  { id: "schedule",     label: "Manage Schedule",   icon: <CalendarDays size={20} />,  path: "/hospital-schedule" },
  { id: "stock",        label: "Manage Stock",      icon: <PackageOpen size={20} />,   path: "/hospital-stock" },
  { id: "appointments", label: "View Appointments", icon: <ClipboardList size={20} />, path: "/hospital-appointments" },
  { id: "slots",        label: "Slots",             icon: <Clock size={20} />,         path: "/hospital-slots" },
  { id: "rating",       label: "View Rating",       icon: <Star size={20} />,          path: "/hospital-rating" },
  { id: "settings",     label: "Settings",          icon: <Settings size={20} />,      path: "/hospital-settings" },
];

const backRoutes = {
  "/hospital-settings/profile":       { back: "/hospital-settings" },
  "/hospital-settings/notifications": { back: "/hospital-settings" },
  "/hospital-settings/password":      { back: "/hospital-settings" },
  "/hospital-settings/payment":       { back: "/hospital-settings" },
};

// ✅ Shared hospital data — lives right here, no separate file needed.
// HospitalLayout fetches it ONCE; every page inside it (Profile, Payment,
// Settings, etc.) reads/updates the SAME data via the useHospital() hook below.
const HospitalDataContext = createContext(null);

export const useHospital = () => {
  const ctx = useContext(HospitalDataContext);
  if (!ctx) {
    throw new Error("useHospital must be used inside HospitalLayout");
  }
  return ctx;
};

const HospitalLayout = ({ activeModule, topbarTitle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  const token = localStorage.getItem("token");

  // ===== Shared hospital profile state =====
  const [hospital, setHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState("");

  const fetchProfile = useCallback(async () => {
    setHospitalLoading(true);
    setHospitalError("");
    try {
      const response = await fetch("http://localhost:5000/api/hospital/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setHospitalError(result.message || "Failed to load hospital profile.");
        return;
      }
      setHospital(result);
    } catch (err) {
      setHospitalError("Server error. Please try again later.");
    } finally {
      setHospitalLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ One update function used by Profile page AND Payment page.
  // After saving, it updates the shared state so EVERY page (and the topbar
  // avatar below) reflects the new data instantly — no refresh needed.
  const updateProfile = async (fields, file) => {
    const payload = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) payload.append(key, value);
    });
    if (file) payload.append("certificate", file);

    const response = await fetch("http://localhost:5000/api/hospital/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update profile.");
    }

    setHospital(result.hospital); // ✅ triggers re-render everywhere it's used
    return result.hospital;
  };

  const isDashboard = location.pathname === "/hospital-dashboard";
  const backInfo = backRoutes[location.pathname];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  // ✅ Real initial for the avatar circle (falls back to "H" while loading)
  const avatarLetter = hospital?.name ? hospital.name.charAt(0).toUpperCase() : "H";

  return (
    <HospitalDataContext.Provider
      value={{ hospital, loading: hospitalLoading, error: hospitalError, fetchProfile, updateProfile }}
    >
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={logo} alt="KVB" className="sidebar-logo-img" />
            <span className="sidebar-logo-text">KVB</span>
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
            <div className="topbar-right">
              {isDashboard && <Notificationbell />}
              <div className="user-avatar"
                onClick={() => navigate("/hospital-settings/profile")}
                style={{ cursor: "pointer" }}
                title={hospital?.name || ""}>
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
              <p>Are you sure you want to log out of your account?</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
                <button className="btn-danger-solid" onClick={confirmLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HospitalDataContext.Provider>
  );
};

export default HospitalLayout;
