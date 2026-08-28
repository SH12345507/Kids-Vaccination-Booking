import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FloatingMenu.css";
import {
  Plus,
  X,
  Home,
  Info,
  BookOpen,
  CircleHelp,
} from "lucide-react";

const FloatingMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Login/Signup screens par menu hide rakhte hain
  const hiddenOn = ["/login", "/parent-signup", "/hospital-signup", "/forgot-password"];
  if (hiddenOn.includes(location.pathname)) return null;

  const menuItems = [
    { label: "Home", icon: <Home size={18} />, path: "/", bg: "#eef1f4" },
    { label: "About", icon: <CircleHelp size={18} />, path: "/about", bg: "#fdf0d5" },
    { label: "Guidance", icon: <BookOpen size={18} />, path: "/guidance", bg: "#e0f5f3" },
    { label: "Vaccine Info", icon: <Info size={18} />, path: "/vaccine-info", bg: "#e8f1fc" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="floating-menu">
      {open && (
        <div className="floating-menu-items">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="floating-menu-item"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="floating-menu-label">{item.label}</span>
              <div className="floating-menu-icon" style={{ backgroundColor: item.bg }}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className={`floating-menu-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Quick access menu"
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
};

export default FloatingMenu;
