import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import Footer from "../../../Components/Footer/Footer";
import { ShieldPlus, Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from "lucide-react";

// ✅ Steps: "email" -> "otp" -> "password" -> "done"
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== Step 1: request a code =====
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setStep("otp");
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 2: verify the code =====
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid or expired code.");
        setLoading(false);
        return;
      }
      setStep("password");
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 3: set the new password =====
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setStep("done");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <header className="navbar">
        <div className="navbar-left">
          <ShieldPlus size={26} color="#2563eb" />
          <span className="brand-name">KVB</span>
        </div>
      </header>

      <div className="forgot-wrapper">
        <div className="form-card forgot-card">

          {/* ===== Step 1: Enter email ===== */}
          {step === "email" && (
            <>
              <h1>Forgot Password?</h1>
              <p className="subtitle">
                No worries. Enter the email address associated with your
                account and we'll send you a 6-digit code.
              </p>

              <form onSubmit={handleSendCode}>
                <div className="form-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send Code"}
                </button>
              </form>
            </>
          )}

          {/* ===== Step 2: Enter the OTP code ===== */}
          {step === "otp" && (
            <>
              <h1>Enter Code</h1>
              <p className="subtitle">
                We've sent a 6-digit code to <strong>{email}</strong>. Enter
                it below to continue.
              </p>

              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="field-label">Verification Code</label>
                  <div className="input-group">
                    <KeyRound size={18} className="input-icon" />
                    <input
                      type="text"
                      inputMode="numeric"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="hint-text">Code expires in 10 minutes.</p>
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
              >
                Wrong email? Go back
              </button>
            </>
          )}

          {/* ===== Step 3: Set new password ===== */}
          {step === "password" && (
            <>
              <h1>Reset Password</h1>
              <p className="subtitle">Choose a new password for your account.</p>

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="field-label">New Password</label>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Confirm Password</label>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {/* ===== Step 4: Success ===== */}
          {step === "done" && (
            <div className="success-state">
              <div className="success-icon">
                <CheckCircle size={32} color="#0f6e56" />
              </div>
              <h1>Password Reset!</h1>
              <p className="subtitle">
                Your password has been changed successfully. Redirecting you
                to login...
              </p>
            </div>
          )}

          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;