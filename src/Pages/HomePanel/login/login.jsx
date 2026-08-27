import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import bgImage from "../../../assets/childVaccine.jpeg";
import PageHero from "../../../components/PageHero/PageHero";
import Footer from "../../../components/Footer/Footer";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Clock } from "lucide-react";


const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false); // ✅ hospital awaiting approval

  const [formData, setFormData] = useState({ email: "", password: "" });
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

  useEffect(() => {
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Hospital account exists but admin hasn't approved it yet
        if (data.pending) {
          setPendingApproval(true);
          setLoading(false);
          return;
        }
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "hospital") {
        navigate("/hospital-dashboard");
      } else if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/parent-dashboard");
      }

    } catch (err) {
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  // ✅ Pending Approval Popup (shown on top of the login page)
  if (pendingApproval) {
    return (
      <div className="page-bg">
        <PageHero
          image={bgImage}
          title="Login"
          description="Enter your credentials to access your account."
        />

        <div className="pending-wrapper">
          <div className="pending-card">
            <div className="pending-icon">
              <Clock size={28} color="#b45309" />
            </div>
            <h2>Waiting for Admin Approval</h2>
            <p>
              Your hospital registration has already been submitted. Please wait
              while our admin reviews your information. You will be able to
              login once your account is approved.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: "20px" }}
              onClick={() => setPendingApproval(false)}
            >
              Back to Login
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page-bg">
      <PageHero
        image={bgImage}
        title="Login"
        description="Enter your credentials to access your account."
      />

      <div className="login-wrapper">
        <div className="form-card login-card">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="field-label">Email Address</label>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <span className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : <> Login <ArrowRight size={18} /> </>}
            </button>
          </form>
        </div>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/parent-signup" className="login-link">Sign Up</Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
