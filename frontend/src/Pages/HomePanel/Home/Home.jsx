import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../../../assets/logo.png";
import vaccinationImg from "../../../assets/Vaccination-hero.jpeg";
import docMotherImg from "../../../assets/mother.jpeg";
import handGlovesImg from "../../../assets/handGloves.jpeg";
import Footer from "../../../Components/Footer/Footer";
import {
  Info, BookOpen, Users, PlusSquare, Shield,
   UserCircle, ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    { title: "Kids Vaccination Booking", subtitle: "Your trusted partner in child wellness.", image: vaccinationImg },
    { title: "Stay On Schedule", subtitle: "Personalized vaccine schedules for your child, on time, every time.", image: docMotherImg },
    { title: "Find Trusted Hospitals", subtitle: "Discover verified hospitals and clinics.", image: handGlovesImg },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: "Vaccine Info",     desc: "Learn about vaccines by age.",          icon: <Info size={28} color="#2563eb" />,     bg: "#e8f1fc", path: "/vaccine-info" },
    { title: "Guidance",         desc: "Tips & guides for child wellness.",      icon: <BookOpen size={28} color="#0d9488" />, bg: "#e0f5f3", path: "/guidance" },
    { title: "Parent Signup",    desc: "Create your account.",                   icon: <Users size={28} color="#b45309" />,    bg: "#fdf0d5", path: "/parent-signup" },
    { title: "Hospital Signup",  desc: "Register your healthcare facility.",     icon: <PlusSquare size={28} color="#2563eb" />, bg: "#e8f1fc", path: "/hospital-signup" },
    { title: "", icon: <Shield size={36} color="#60a5fa" />, bg: "transparent", empty: true },
  ];

  return (
    <div className="page-bg">
      <section className="hero-banner">
        {heroSlides.map((slide, idx) => (
          <img key={idx} src={slide.image} alt=""
            className={`hero-banner-img ${idx === heroSlide ? "active" : ""}`} />
        ))}
        <div className="hero-overlay"></div>

        {/* Navbar */}
        <header className="navbar navbar-transparent">
          <div className="navbar-left">
            <img src={logo} alt="KVB" className="navbar-logo-img" />
            <span className="brand-name brand-name-light navbar-brand-text">KVB</span>
          </div>
          <div className="navbar-right">
            <UserCircle size={22} className="icon-btn icon-btn-light"
              onClick={() => navigate("/login")} />
          </div>
        </header>

        <div className="hero-content">
          <button className="hero-arrow left"
            onClick={() => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>
            <ChevronLeft size={22} />
          </button>
          <div className="hero-text" key={heroSlide}>
            <h1>{heroSlides[heroSlide].title}</h1>
            <p>{heroSlides[heroSlide].subtitle}</p>
          </div>
          <button className="hero-arrow right"
            onClick={() => setHeroSlide((prev) => (prev + 1) % heroSlides.length)}>
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="hero-dots">
          {heroSlides.map((_, idx) => (
            <span key={idx} className={`dot ${idx === heroSlide ? "active" : ""}`}
              onClick={() => setHeroSlide(idx)}></span>
          ))}
        </div>
      </section>

      <section className="cards-grid">
        {cards.map((card, idx) => (
          <div key={idx}
            className={`card ${card.empty ? "card-empty" : ""} fade-in`}
            style={{ animationDelay: `${idx * 0.08}s` }}
            onClick={() => card.path && navigate(card.path)}>
            {!card.empty && (
              <>
                <div className="card-icon" style={{ backgroundColor: card.bg }}>{card.icon}</div>
                <h3>{card.title}</h3>
                {card.desc && <p className="card-desc">{card.desc}</p>}
                <span className="card-arrow"><ArrowRight size={18} /></span>
              </>
            )}
            {card.empty && card.icon}
          </div>
        ))}
      </section>

      <section className="login-card fade-in">
        <h2>Quick Login</h2>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Login <ArrowRight size={18} />
        </button>
        <p className="login-subtext">Secure access for registered users.</p>
      </section>

      <Footer />
    </div>
  );
};

export default Home;