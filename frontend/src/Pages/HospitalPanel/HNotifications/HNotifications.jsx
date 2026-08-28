import React, { useState, useEffect } from "react";
import "./HNotifications.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";

const API_BASE = "http://localhost:5000/api";

const HNotifications = () => {
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState({
    vaccineReminders: true,
    emailAlerts: true,
    smsAlerts: false,
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
    <HospitalLayout activeModule="settings" topbarTitle="Notifications">

      <div className="settings-wrapper">
        <div className="form-card settings-list">

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>Vaccine Reminders</h4>
              <p>Get reminded before an upcoming vaccine is due.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox"
                checked={notifications.vaccineReminders}
                onChange={() => toggle("vaccineReminders")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>Email Alerts</h4>
              <p>Receive updates and reminders via email.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => toggle("emailAlerts")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notif-row">
            <div className="notif-row-info">
              <h4>SMS Alerts</h4>
              <p>Receive updates and reminders via SMS.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox"
                checked={notifications.smsAlerts}
                onChange={() => toggle("smsAlerts")} />
              <span className="toggle-slider"></span>
            </label>
          </div>

        </div>
      </div>

      <Footer />
    </HospitalLayout>
  );
};

export default HNotifications;