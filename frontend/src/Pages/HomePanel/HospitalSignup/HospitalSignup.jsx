import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HospitalSignup.css";
import hospitalImg from "../../../assets/Hospital.png";
import PageHero from "../../../Components/PageHero/PageHero";
import Footer from "../../../Components/Footer/Footer";
import {
  Plus, Mail, Phone, MapPin, Lock, EyeOff, Eye,
  UploadCloud, Building2, CreditCard, Home, Hospital, Clock,
} from "lucide-react";

const HospitalSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false); // ✅ signup done, awaiting admin approval

  const [formData, setFormData] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    serviceType: "private",
    visitType: "hospital",
    hospitalVisitCharges: "",
    homeVisitCharges: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Certificate is required for verification
    if (!file) {
      setError("Please upload your verification certificate.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.hospitalName);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("type", formData.serviceType === "private" ? "Private" : "Government");
      payload.append("visitType", formData.visitType);
      payload.append("hospitalVisitCharges", formData.hospitalVisitCharges || 0);
      payload.append("homeVisitCharges", formData.homeVisitCharges || 0);
      payload.append("certificate", file); // ✅ actual file goes here

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/hospital-signup`, {
        method: "POST",
        body: payload, // ✅ no Content-Type header — browser sets multipart boundary itself
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Signup successful — show pending approval popup instead of redirecting
      setRegistered(true);
      setLoading(false);

    } catch (err) {
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  // ✅ Registration Successful / Pending Approval Popup
  if (registered) {
    return (
      <div className="page-bg">
        <PageHero
          image={hospitalImg}
          title="Register Your Hospital"
          description="Help us protect the next generation. Register your facility to get started."
        />

        <div className="pending-wrapper">
          <div className="pending-card">
            <div className="pending-icon">
              <Clock size={28} color="#b45309" />
            </div>
            <h2>Registered Successfully</h2>
            <p>
              Your hospital has been registered successfully. Please wait until
              our admin reviews and approves your account. You will be able to
              log in once approved.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/login")}
            >
              Go to Login
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
        image={hospitalImg}
        title="Register Your Hospital"
        description="Help us protect the next generation. Register your facility to get started."
      />

      <div className="form-wrapper">
        <div className="form-card">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="field-label">Hospital Name</label>
              <div className="input-group">
                <Plus size={18} className="input-icon" />
                <input type="text" name="hospitalName" placeholder="Enter hospital name"
                  value={formData.hospitalName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Hospital Email</label>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" placeholder="Enter hospital email"
                  value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Phone Number</label>
              <div className="input-group">
                <Phone size={18} className="input-icon" />
                <input type="tel" name="phone" placeholder="Enter phone number"
                  value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Full Address</label>
              <div className="input-group textarea-group">
                <MapPin size={18} className="input-icon textarea-icon" />
                <textarea name="address" placeholder="Enter full address"
                  value={formData.address} onChange={handleChange} rows="4" required />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Password</label>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type={showPassword ? "text" : "password"} name="password"
                  placeholder="Create a strong password"
                  value={formData.password} onChange={handleChange} required />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>

            {/* ===== Service Type ===== */}
            <div className="form-group">
              <label className="field-label">Service Type</label>
              <div className="radio-group">
                <label className={`radio-option ${formData.serviceType === "private" ? "selected" : ""}`}>
                  <input type="radio" name="serviceType" value="private"
                    checked={formData.serviceType === "private"} onChange={handleChange} />
                  <CreditCard size={18} /><span>Private</span>
                </label>
                <label className={`radio-option ${formData.serviceType === "government" ? "selected" : ""}`}>
                  <input type="radio" name="serviceType" value="government"
                    checked={formData.serviceType === "government"} onChange={handleChange} />
                  <Building2 size={18} /><span>Government</span>
                </label>
              </div>
            </div>

           

            {/* ===== Visit Charges (Private only) ===== */}
            <div className={`payment-section ${formData.serviceType === "government" ? "payment-hidden" : ""}`}>
              <label className="field-label">Visit Charges</label>
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label field-label-sub">
                    <Hospital size={14} style={{ marginRight: 5, verticalAlign: "-2px" }} />
                    Hospital Visit
                  </label>
                  <div className="input-group">
                    <span className="currency-prefix">Rs.</span>
                    <input type="number" name="hospitalVisitCharges" placeholder="e.g. 500"
                      min="0" value={formData.hospitalVisitCharges} onChange={handleChange}
                      disabled={formData.serviceType === "government"} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="field-label field-label-sub">
                    <Home size={14} style={{ marginRight: 5, verticalAlign: "-2px" }} />
                    Home Visit
                  </label>
                  <div className="input-group">
                    <span className="currency-prefix">Rs.</span>
                    <input type="number" name="homeVisitCharges" placeholder="e.g. 1000"
                      min="0" value={formData.homeVisitCharges} onChange={handleChange}
                      disabled={formData.serviceType === "government"} />
                  </div>
                </div>
              </div>
            </div>

            <label className="upload-label">Upload Verification Certificate</label>
            <div className="upload-box" onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileInput").click()}>
              <UploadCloud size={28} className="upload-icon" />
              <p><span className="upload-link">Click to upload</span> or drag and drop</p>
              <span className="upload-info">PDF, PNG, JPG up to 5MB</span>
              <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange} hidden />
              {file && <p className="file-name">{file.name}</p>}
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Account"}
            </button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login" className="login-link">Log in</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HospitalSignup;
