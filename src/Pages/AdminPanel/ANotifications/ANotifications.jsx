import React, { useState, useEffect } from "react";
import "./ANotifications.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";

const API_BASE = "http://localhost:5000/api";

const ANotifications = () => {
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState({
    hospitalRequests: true,
    emailAlerts: true,
    smsAlerts: false,
    systemAlerts: true,
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setNotifications((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load notification preferences:", err);
      }
    };
    fetchPrefs();
    // eslint-disable-next-line
  }, []);

  const toggle = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated); // ✅ optimistic update

    try {
      await fetch(`${API_BASE}/notifications/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: updated[key] }),
      });
    } catch (err) {
      console.error("Failed to save notification preference:", err);
    }
  };

  return (
    <AdminLayout activeModule="settings" topbarTitle="Notifications">

      <div className="settings-wrapper">
        <div className="form-card settings-list">

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>Hospital Requests</h4>
              <p>Get notified when a new hospital registration request comes in.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.hospitalRequests} onChange={() => toggle("hospitalRequests")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>Email Alerts</h4>
              <p>Receive admin updates and alerts via email.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.emailAlerts} onChange={() => toggle("emailAlerts")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>SMS Alerts</h4>
              <p>Receive admin updates and alerts via SMS.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.smsAlerts} onChange={() => toggle("smsAlerts")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>System Alerts</h4>
              <p>Get notified about system errors or important updates.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.systemAlerts} onChange={() => toggle("systemAlerts")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

        </div>
      </div>

      <Footer />
    </AdminLayout>
  );
};

export default ANotifications;