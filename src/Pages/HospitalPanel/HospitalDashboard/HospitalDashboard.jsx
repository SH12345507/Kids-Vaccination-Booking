import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDashboard.css";
import hospitalImg from "../../../assets/HDashboard.jpeg";
import "../../../styles/Hospitalshared.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import { CalendarDays, PackageOpen, ClipboardList, Settings, Bell, Users, AlertCircle, Clock, Star } from "lucide-react";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Appointments", value: "0", icon: <CalendarDays size={22} color="#2563eb" />, bg: "#e8f1fc" },
    { label: "Vaccines in Stock",  value: "0", icon: <PackageOpen size={22} color="#0d9488" />,  bg: "#e0f5f3" },
    { label: "Patients Today",     value: "0", icon: <Users size={22} color="#b45309" />,        bg: "#fdf0d5" },
    { label: "Pending Reviews",    value: "0", icon: <AlertCircle size={22} color="#ef4444" />,  bg: "#fde8e8" },
  ];

  const modules = [
    { id: "schedule",     path: "/hospital-schedule",     title: "Manage Schedule",   desc: "Sets the Schedule of vaccination and mark as given when 1 dose completed.",                           icon: <CalendarDays size={26} color="#2563eb" />, bg: "#e8f1fc" },
    { id: "stock",        path: "/hospital-stock",        title: "Manage Stock",      desc: "Manage and view the current inventory of vaccines and supplies.",                                      icon: <PackageOpen size={26} color="#0d9488" />,  bg: "#e0f5f3" },
    { id: "appointments", path: "/hospital-appointments", title: "View Appointments", desc: "See all upcoming and past appointments, confirm bookings, and manage patient visit details.",          icon: <ClipboardList size={26} color="#b45309" />, bg: "#fdf0d5" },
    { id: "slots",        path: "/hospital-slots",        title: "Slots",             desc: "Manage your available appointment slots and set timings for vaccination sessions.",                    icon: <Clock size={26} color="#7c3aed" />,        bg: "#f0ebff" },
    { id: "rating",       path: "/hospital-rating",       title: "View Rating",       desc: "See ratings and feedback given by parents about your hospital's vaccination services.",               icon: <Star size={26} color="#d97706" />,         bg: "#fef3c7" },
    { id: "settings",     path: "/hospital-settings",     title: "Settings",          desc: "Update your hospital profile, password, operating hours, and account preferences.",                   icon: <Settings size={26} color="#475569" />,     bg: "#eef1f4" },
  ];

  return (
    <HospitalLayout activeModule="overview" topbarTitle="Hospital Dashboard">

      <section className="hospital-page-hero hospital-page-hero-xl">
        <img src={hospitalImg} alt="" className="hospital-page-hero-img" />
        <div className="hospital-page-hero-overlay"></div>
        <div className="hospital-page-hero-content">
          <h1>Welcome back! 🏥</h1>
          <p>Manage your schedules, vaccine stock, and patient appointments all from one place.</p>
        </div>
      </section>

      <div className="stats-row">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon" style={{ backgroundColor: stat.bg }}>{stat.icon}</div>
            <div className="stat-info"><h3>{stat.value}</h3><p>{stat.label}</p></div>
          </div>
        ))}
      </div>

      <section className="modules-grid">
        {modules.map((mod) => (
          <div className="module-card" key={mod.id} onClick={() => navigate(mod.path)}>
            <div className="module-icon" style={{ backgroundColor: mod.bg }}>{mod.icon}</div>
            <h3>{mod.title}</h3>
            <p>{mod.desc}</p>
          </div>
        ))}
      </section>

      <Footer />
    </HospitalLayout>
  );
};

export default HospitalDashboard;
