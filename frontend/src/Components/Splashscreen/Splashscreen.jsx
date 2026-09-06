import React from "react";
import "./Splashscreen.css";
import logo from "../../assets/logo.png";

const SplashScreen = () => {
  const bars = Array.from({ length: 12 });

  return (
    <div className="splash-screen">
      <img src={logo} alt="KVB" className="splash-logo" />
      <span className="splash-brand">KVB</span>
      <div className="splash-spinner">
        {bars.map((_, i) => (
          <div
            key={i}
            className="splash-spinner-bar"
            style={{
              transform: `rotate(${i * 30}deg)`,
              animationDelay: `${-(1.2 - (i * 1.2) / 12)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;