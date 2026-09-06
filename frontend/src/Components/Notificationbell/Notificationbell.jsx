import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import "./Notificationbell.css";

const API_BASE = import.meta.env.VITE_API_BASE || `${import.meta.env.VITE_API_URL}/api`;

// ✅ Self-contained — fetches the logged-in user's OWN notifications
// (works for parent/hospital/admin, whichever role is logged in) and keeps
// them synced with the backend. No props needed from the layout anymore.
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const wrapperRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    // ✅ light polling so new notifications appear without a manual refresh
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = items.filter((n) => !n.read).length;

  // Dropdown ke bahar click karne par band ho jaye
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true }))); // optimistic
    try {
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const formatTime = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        className="notif-bell-btn"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge"></span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">No notifications yet.</div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${!n.read ? "unread" : ""}`}
                >
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-message">{n.message}</p>
                  <p className="notif-time">{formatTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;