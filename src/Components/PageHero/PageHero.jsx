import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { UserCircle } from "lucide-react";

const PageHero = ({ image, title, description, showProfileIcon = true }) => {
  const navigate = useNavigate();

  return (
    <section className="hero-banner">
      <img src={image} alt="" className="hero-banner-img active" />
      <div className="hero-overlay"></div>

      <header className="navbar navbar-transparent">
        <div className="navbar-left">
          <img src={logo} alt="KVB" className="navbar-logo-img" />
          <span className="brand-name brand-name-light navbar-brand-text">KVB</span>
        </div>
        <div className="navbar-right">
          {showProfileIcon && (
            <UserCircle size={22} className="icon-btn icon-btn-light"
              onClick={() => navigate("/login")} />
          )}
        </div>
      </header>

      <div className="hero-static">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
};

export default PageHero;