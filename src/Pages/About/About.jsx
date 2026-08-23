import React from "react";
import PageHero from "../../components/PageHero/PageHero";
import Footer from "../../components/Footer/Footer";
import "./About.css";
import aboutImg from "../../assets/vaccination-hero.jpeg";
import {
  ShieldCheck,
  CalendarCheck,
  FileText,
  Hospital,
  Users,
  Bell,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <CalendarCheck size={26} color="#0d9488" />,
      bg: "#e0f5f3",
      title: "Smart Vaccine Schedule",
      desc: "Automatically generated, age-based vaccination schedules for every child.",
    },
    
    {
      icon: <Hospital size={26} color="#2563eb" />,
      bg: "#e8f1fc",
      title: "Verified Hospitals",
      desc: "Connect with trusted, verified hospitals and clinics near you.",
    },
    {
      icon: <Bell size={26} color="#475569" />,
      bg: "#eef1f4",
      title: "Timely Reminders",
      desc: "Never miss a dose with automatic reminders for upcoming vaccinations.",
    },
    {
      icon: <Users size={26} color="#1e5f8e" />,
      bg: "#e8f1fc",
      title: "Multi-Child Support",
      desc: "Manage vaccination records for all your children from a single account.",
    },
    {
      icon: <ShieldCheck size={26} color="#0d9488" />,
      bg: "#e0f5f3",
      title: "Safe & Secure",
      desc: "Your family's health data is stored securely and shared only with your consent.",
    },
  ];

  return (
    <div className="page-bg">
      <PageHero
        image={aboutImg}
        title="About Us"
        description="Helping parents keep their children safe, healthy, and on schedule."
      />

      <section className="about-intro">
        <h2>Who We Are</h2>
        <p>
          Kids Vaccination Booking (KVB) is a platform built to make child
          immunization simple, organized, and stress-free for parents. We
          bring together vaccine schedules, upcoming vaccine remainders, easy access to vaccination history and
          trusted hospitals in one easy-to-use place, so families never have
          to worry about missing an important dose again.
        </p>
      </section>

      <section className="about-mission">
        <h2>Our Purpose</h2>
        <p>
          Our mission is to reduce missed and delayed vaccinations by giving
          parents clear, timely, and reliable information about their
          child's immunization needs — while making it easy to book
          appointments and access verified medical records whenever needed.
        </p>
      </section>

      <section className="about-features">
        <h2>What We Offer</h2>
        <div className="about-features-grid">
          {features.map((f, idx) => (
            <div className="about-feature-card fade-in" key={idx} style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="about-feature-icon" style={{ backgroundColor: f.bg }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
