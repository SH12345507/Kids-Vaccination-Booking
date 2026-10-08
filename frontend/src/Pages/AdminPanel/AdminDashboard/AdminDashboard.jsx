import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import adminImg from "../../../assets/Admin.png";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";
import {
  Hospital, Users, Star, Settings,
  AlertCircle, Clock,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ===== DASHBOARD STATS =====
  const [statsData, setStatsData] = useState({
    totalHospitals: 0,
    totalParents: 0,
    pendingRequests: 0,
    systemAlerts: 0,
  });

  // ===== GET STATS FROM BACKEND =====
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();

        // 🔍 Debug: F12 -> Console me ye dono lines dekhein
        console.log("STATS STATUS:", response.status);
        console.log("STATS DATA:", data);

        if (response.ok) {
          setStatsData({
            totalHospitals: data.totalHospitals ?? 0,
            totalParents: data.totalParents ?? 0,
            pendingRequests: data.pendingRequests ?? 0,
            systemAlerts: data.systemAlerts ?? 0,
          });
        } else {
          console.error("Failed to get dashboard stats:", data.message);
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    {
      label: "Total Hospitals",
      value: statsData.totalHospitals,
      icon: <Hospital size={22} color="#2563eb" />,
      bg: "#e8f1fc",
    },
    {
      label: "Total Parents",
      value: statsData.totalParents,
      icon: <Users size={22} color="#0d9488" />,
      bg: "#e0f5f3",
    },
    {
      label: "Pending Requests",
      value: statsData.pendingRequests,
      icon: <Clock size={22} color="#b45309" />,
      bg: "#fdf0d5",
    },
    {
      label: "System Alerts",
      value: statsData.systemAlerts,
      icon: <AlertCircle size={22} color="#ef4444" />,
      bg: "#fde8e8",
    },
  ];

  const modules = [
    {
      id: "hospitals",
      path: "/admin-hospitals",
      title: "Manage Hospitals",
      desc: "View, approve or reject hospital registration requests. Monitor all registered hospitals.",
      icon: <Hospital size={26} color="#2563eb" />,
      bg: "#e8f1fc",
    },
    {
      id: "parents",
      path: "/admin-parents",
      title: "Manage Parents",
      desc: "View all registered parents and their children's vaccination records.",
      icon: <Users size={26} color="#0d9488" />,
      bg: "#e0f5f3",
    },
    {
      id: "ratings",
      path: "/admin-ratings",
      title: "View Ratings",
      desc: "Monitor ratings and feedback given by parents across all hospitals.",
      icon: <Star size={26} color="#d97706" />,
      bg: "#fef3c7",
    },
    {
      id: "settings",
      path: "/admin-settings",
      title: "Settings",
      desc: "Manage admin account, system preferences and configurations.",
      icon: <Settings size={26} color="#475569" />,
      bg: "#eef1f4",
    },
  ];

  return (
    <AdminLayout activeModule="dashboard" topbarTitle="Admin Dashboard">

      {/* Hero */}
      <section className="admin-hero">
        <img src={adminImg} alt="" className="admin-hero-img" />
        <div className="admin-hero-overlay"></div>

        <div className="admin-hero-content">
          <h1>Welcome, Admin! 🛡️</h1>
          <p>
            Monitor hospitals, parents, and the overall vaccination system
            from one place.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-row">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx} style={{ backgroundColor: stat.bg }}>
            <div
              className="stat-icon"
              style={{ backgroundColor: stat.bg }}
            >
              {stat.icon}
            </div>

            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <section className="modules-grid">
        {modules.map((mod) => (
          <div
            className="module-card"
            key={mod.id}
            onClick={() => navigate(mod.path)}
          >
            <div
              className="module-icon"
              style={{ backgroundColor: mod.bg }}
            >
              {mod.icon}
            </div>

            <h3>{mod.title}</h3>
            <p>{mod.desc}</p>
          </div>
        ))}
      </section>

      <Footer />
    </AdminLayout>
  );
};

export default AdminDashboard;