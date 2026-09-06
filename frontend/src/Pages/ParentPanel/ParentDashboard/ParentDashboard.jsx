import React from "react";
import { useNavigate } from "react-router-dom";
import "./ParentDashboard.css";
import motherImg from "../../../assets/PDashboard.jpeg";
import Footer from "../../../Components/Footer/Footer";
import ParentLayout from "../../../Components/ParentLayout/ParentLayout";
import {
  UserPlus,
  CalendarCheck,
  Settings as SettingsIcon,
} from "lucide-react";

const ParentDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "add-child",
      title: "Add Child",
      desc: "Register a new child profile to start tracking their vaccination journey.",
      icon: <UserPlus size={26} color="#1e5f8e" />,
      bg: "#e8f1fc",
      path: "/add-child",
    },
    {
      id: "schedule",
      title: "Vaccine Overview",
      desc: "View upcoming vaccines and your child's complete vaccination history in one place.",
      icon: <CalendarCheck size={26} color="#0d9488" />,
      bg: "#e0f5f3",
      path: "/vaccine-schedule",
    },
    {
      id: "settings",
      title: "Settings",
      desc: "Manage your profile, notifications, and account preferences.",
      icon: <SettingsIcon size={26} color="#475569" />,
      bg: "#eef1f4",
      path: "/settings",
    },
  ];

  return (
    <ParentLayout topbarTitle="Parent Dashboard">
      <section className="welcome-hero">
        <img src={motherImg} alt="" className="welcome-hero-img" />
        <div className="welcome-hero-overlay"></div>
        <div className="welcome-hero-content">
          <h1>Welcome back!</h1>
          <p>Keep track of your child's vaccinations, schedules, and health records all in one place.</p>
        </div>
      </section>

      <section className="modules-grid">
        {modules.map((mod) => (
          <div
            className="module-card"
            key={mod.id}
            onClick={() => navigate(mod.path)}
          >
            <div className="module-icon" style={{ backgroundColor: mod.bg }}>
              {mod.icon}
            </div>
            <h3>{mod.title}</h3>
            <p>{mod.desc}</p>
          </div>
        ))}
      </section>

      <Footer />
    </ParentLayout>
  );
};

export default ParentDashboard;
