import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddChild.css";
import motherImg from "../../../assets/mother.jpeg";
import PageHero from "../../../components/PageHero/PageHero";
import Footer from "../../../components/Footer/Footer";
import HospitalModal from "../Hospitalmodal/HospitalModal";
import {
  User,
  FileText,
  MapPin,
  UploadCloud,
  ArrowRight,
  Home,
  Building2,
  CreditCard,
  Calendar,
  Eye,
  Star,
  ChevronDown,
  ChevronUp,
  Syringe,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const AddChild = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ guards against duplicate submissions

  const [formData, setFormData] = useState({
    childName: "",
    guardianName: "",
    guardianCnic: "",
    dateOfBirth: "",
    address: "",
    serviceType: "private",
    hospital: "",
    requestType: "hospital",
    autoSchedule: false,
    startVaccine: "",
  });

  const [childPicture, setChildPicture] = useState(null);
  const [birthCertificate, setBirthCertificate] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [viewHospital, setViewHospital] = useState(null);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);

  const [vaccineList, setVaccineList] = useState([]);

  // ✅ Fetch the master vaccine list once — used to suggest/select where the
  // schedule should start based on the child's current age.
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await fetch(`${API_BASE}/vaccines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVaccineList(res.ok ? data : []);
      } catch (err) {
        console.error("Failed to fetch vaccines:", err);
        setVaccineList([]);
      }
    };
    fetchVaccines();
    // eslint-disable-next-line
  }, []);

  const calcAgeInDays = (dob) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatAge = (days) => {
    if (days === null) return "—";
    const years = days / 365.25;
    if (years < 1) return `${Math.floor(days / 30.44)} months`;
    return `${Math.floor(years)} years`;
  };

  // ✅ While the user is still typing the year in the date input (e.g. "2" → "20"
  // → "200" → "2002"), the field can briefly hold a technically-valid but
  // nonsensical date (year 2, 20, 200...), which made the age calculation
  // (and the "ineligible" warning) flash on too early. Only treat the DOB as
  // "complete" once it has a full 4-digit year within a sane range.
  const isCompleteDob = (dob) => {
    if (!dob) return false;
    const yearStr = dob.split("-")[0];
    if (yearStr.length !== 4) return false;
    const year = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1900 && year <= currentYear;
  };

  const dobIsComplete = isCompleteDob(formData.dateOfBirth);
  const currentAgeInDays = dobIsComplete ? calcAgeInDays(formData.dateOfBirth) : null;

  // ✅ next vaccine that fits the child's current age (list is pre-sorted by ageInDays)
  const suggestedVaccine =
    currentAgeInDays !== null
      ? vaccineList.find((v) => v.ageInDays >= currentAgeInDays)
      : null;

  // ✅ child is only "ineligible" once we actually have enough info to judge —
  // DOB fully entered, vaccine list loaded, and no vaccine left that fits their age
  const isIneligibleForSchedule =
    dobIsComplete && vaccineList.length > 0 && !suggestedVaccine;

  // ✅ The vaccine actually in play right now — whatever the parent manually
  // picked in the dropdown, falling back to the age-based suggestion. Used to
  // ask the hospital-list endpoint which hospitals actually stock it.
  const effectiveVaccineId = formData.startVaccine || suggestedVaccine?._id || "";
  const effectiveVaccine =
    vaccineList.find((v) => v._id === effectiveVaccineId) || suggestedVaccine || null;
  const selectedVaccineName = !isIneligibleForSchedule ? effectiveVaccine?.name || "" : "";

  // ✅ if the child becomes ineligible (e.g. DOB changed to an older date),
  // force Auto Schedule off so an invalid schedule can't be submitted
  useEffect(() => {
    if (isIneligibleForSchedule && formData.autoSchedule) {
      setFormData((prev) => ({ ...prev, autoSchedule: false, startVaccine: "" }));
    }
    // eslint-disable-next-line
  }, [isIneligibleForSchedule]);

  // ✅ Fetch approved hospitals every time serviceType (private/government)
  // changes, or the determined vaccine changes. Passing vaccineName lets the
  // backend hide hospitals that don't stock this vaccine at all, and flag
  // (without hiding) hospitals that stock it but are currently at 0 quantity.
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const type = formData.serviceType === "government" ? "Government" : "Private";
        const params = new URLSearchParams({ type });
        if (selectedVaccineName) params.set("vaccineName", selectedVaccineName);

        const res = await fetch(`${API_BASE}/hospital/public?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHospitals(res.ok ? data : []);
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
    // reset previously selected hospital when switching private/government
    // or when the vaccine changes — the previous list may no longer apply
    setFormData((prev) => ({ ...prev, hospital: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.serviceType, selectedVaccineName]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // ✅ Select a hospital from the dropdown list, then close the list
  const handleHospitalSelect = (hospitalId) => {
    setFormData((prev) => ({ ...prev, hospital: hospitalId }));
    setShowHospitalDropdown(false);
  };

  // ✅ Submit/update a rating for a hospital, then refresh the list so averageRating updates
  const handleRateHospital = async (hospitalId, rating, comment) => {
    try {
      const res = await fetch(`${API_BASE}/hospital/public/${hospitalId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const result = await res.json();

      if (res.ok) {
        setHospitals((prev) =>
          prev.map((h) =>
            h._id === hospitalId ? { ...h, averageRating: result.averageRating } : h
          )
        );
        setViewHospital(null);
      } else {
        alert(result.message || "Failed to submit rating.");
      }
    } catch (err) {
      console.error("Failed to submit rating:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Ignore any extra submit events (double-click, double-tap, accidental
    // Enter + click) that arrive while a request is already in flight.
    if (isSubmitting) return;

    setSubmitError("");

    if (formData.requestType === "hospital" && !formData.hospital) {
      setSubmitError("Please select a hospital before submitting.");
      return;
    }

    if (formData.autoSchedule && isIneligibleForSchedule) {
      setSubmitError(
        "This child is not eligible for Auto Schedule — their age is beyond the recommended vaccination range."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));

      // ✅ Send the selected/suggested vaccine whenever one applies — used to
      // build the full schedule (autoSchedule on) or a single entry (off).
      // If the parent never touched the dropdown, fall back to the suggestion.
      if (!isIneligibleForSchedule) {
        data.set("startVaccine", formData.startVaccine || suggestedVaccine?._id || "");
      }

      if (childPicture) data.append("childPicture", childPicture);
      if (birthCertificate) data.append("birthCertificate", birthCertificate);

      const res = await fetch(`${API_BASE}/parent/register-child`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type — browser sets multipart boundary
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.message || "Registration failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setSubmitted(true); // ✅ page switches to the success screen, so no need to reset isSubmitting here
    } catch (err) {
      console.error(err);
      setSubmitError("Server error. Please try again later.");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-bg add-child-page">
        <PageHero
  image={motherImg}
  title="Registration Successful"
  description="Your child has been successfully registered."
  showProfileIcon={false}
/>

        <div className="success-wrapper">
          <div className="success-card form-card">
            <div className="success-circle">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#e0f5f3" />
                <path
                  d="M20 32L28 40L44 24"
                  stroke="#0f6e56"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1>Registration Successful!</h1>
            <p className="subtitle">
              <strong>{formData.childName}</strong> has been successfully
              registered. Your request has been sent and is currently under
              review.
            </p>

            <div className="success-details">
              <div className="success-child-row">
                <span className="success-child-name">{formData.childName}</span>
                <span className="success-badge">Pending Review</span>
              </div>
            </div>

            <p className="subtitle" style={{ marginTop: "4px" }}>
              The vaccine schedule will appear in the Schedule module once the
              hospital approves this request.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                onClick={() => navigate("/parent-dashboard")}
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate("/vaccine-schedule")}
              >
                View Vaccine Schedule <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page-bg add-child-page">
      {/* Navbar */}
      <PageHero
  image={motherImg}
  title="Register Your Child"
  description="Fill in the details below to register your child for vaccination."
  showProfileIcon={false}
/>

      <div className="add-child-wrapper">
        

        <form onSubmit={handleSubmit} className="child-form-card form-card">

          {/* ===== Section 1: Basic Info ===== */}
          <h2 className="section-title">Basic Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="field-label">Child Name</label>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="childName"
                  placeholder="Enter child's full name"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Guardian Name</label>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="guardianName"
                  placeholder="Enter guardian's full name"
                  value={formData.guardianName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="field-label">Guardian / Parent CNIC</label>
              <div className="input-group">
                <FileText size={18} className="input-icon" />
                <input
                  type="text"
                  name="guardianCnic"
                  placeholder="e.g. 42101-1234567-1"
                  value={formData.guardianCnic}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Date of Birth</label>
              <div className="input-group">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {dobIsComplete && !isIneligibleForSchedule && (
            <>
              <div className="auto-schedule-note">
                <Calendar size={16} />
                <span>
                  {suggestedVaccine ? (
                    <>
                      Based on your child's current age (
                      {formatAge(currentAgeInDays)}), the recommended vaccine
                      is <strong>{suggestedVaccine.name}</strong> (
                      {suggestedVaccine.ageLabel}).
                      {formData.autoSchedule
                        ? " The full schedule will start from here."
                        : " Only this vaccine will be added to the schedule."}
                    </>
                  ) : (
                    "Enter your child's date of birth to see a vaccine suggestion."
                  )}
                </span>
              </div>

              <div className="form-group">
                <label className="field-label">
                  <Syringe size={16} />{" "}
                  {formData.autoSchedule ? "Start Schedule From" : "Vaccine"}
                  <span className="optional-tag">
                    {" "}
                    (change this if some vaccines were already given elsewhere,
                    or to pick a different one)
                  </span>
                </label>
                <div className="input-group">
                  <select
                    name="startVaccine"
                    value={formData.startVaccine || suggestedVaccine?._id || ""}
                    onChange={handleChange}
                  >
                    {vaccineList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.ageLabel} — {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {isIneligibleForSchedule && (
            <p className="hint-text" style={{ color: "#b91c1c" }}>
              This child is not eligible for a vaccine schedule — at{" "}
              {formatAge(currentAgeInDays)} old, their age is beyond the
              recommended vaccination range covered by our vaccine schedule.
            </p>
          )}

          <div className="form-group">
            <label className="field-label">Address</label>
            <div className="input-group textarea-group">
              <MapPin size={18} className="input-icon textarea-icon" />
              <textarea
                name="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
          </div>

          {/* ===== Section 2: Service Type ===== */}
          <h2 className="section-title">Service Type</h2>

          <div className="form-group">
            <div className="radio-group">
              <label
                className={`radio-option ${formData.serviceType === "private" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="serviceType"
                  value="private"
                  checked={formData.serviceType === "private"}
                  onChange={handleChange}
                />
                <CreditCard size={18} />
                <span>Private</span>
              </label>

              <label
                className={`radio-option ${formData.serviceType === "government" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="serviceType"
                  value="government"
                  checked={formData.serviceType === "government"}
                  onChange={handleChange}
                />
                <Building2 size={18} />
                <span>Government</span>
              </label>
            </div>
          </div>

          

          {/* ===== Section 3: Request Type ===== */}
          <h2 className="section-title">Request Type</h2>

          <div className="form-group">
            <label className="field-label">
              Where do you want vaccination?
            </label>
            <div className="radio-group">
              <label
                className={`radio-option ${formData.requestType === "home" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="requestType"
                  value="home"
                  checked={formData.requestType === "home"}
                  onChange={handleChange}
                />
                <Home size={18} />
                <span>Home Visit</span>
              </label>

              <label
                className={`radio-option ${formData.requestType === "hospital" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="requestType"
                  value="hospital"
                  checked={formData.requestType === "hospital"}
                  onChange={handleChange}
                />
                <Building2 size={18} />
                <span>Hospital Visit</span>
              </label>
            </div>
          </div>
          {/* Hospital List — fetched from backend based on serviceType */}
          <div className="form-group">
            <label className="field-label">Select Hospital</label>

            <div className="hospital-dropdown">
              <button
                type="button"
                className="hospital-dropdown-trigger"
                onClick={() => setShowHospitalDropdown((prev) => !prev)}
              >
                <div className="hospital-trigger-left">
                  <div className="hospital-trigger-icon">
                    <Building2 size={22} />
                  </div>
                  <span className="hospital-trigger-text">
                    {formData.hospital
                      ? hospitals.find((h) => h._id === formData.hospital)?.name ||
                        "Select Hospital"
                      : "Select Hospital"}
                  </span>
                </div>
                {showHospitalDropdown ? (
                  <ChevronUp size={20} className="hospital-trigger-chevron" />
                ) : (
                  <ChevronDown size={20} className="hospital-trigger-chevron" />
                )}
              </button>

              {showHospitalDropdown &&
                (loadingHospitals ? (
                  <p className="hint-text">Loading hospitals...</p>
                ) : hospitals.length === 0 ? (
                  <p className="hint-text">
                    No {formData.serviceType} hospitals available yet.
                  </p>
                ) : (
                  <div className="hospital-dropdown-panel">
                    {hospitals.map((h) => (
                      <div
                        key={h._id}
                        className="hospital-item"
                        onClick={() => handleHospitalSelect(h._id)}
                      >
                        <div className="hospital-item-left">
                          <span
                            className={`hospital-dot ${
                              formData.hospital === h._id ? "active" : ""
                            }`}
                          />
                          <span className="hospital-item-name">{h.name}</span>
                          {/* ✅ shown only when a vaccine was determined (selectedVaccineName
                              set) and this hospital tracks it but is at 0 quantity —
                              hospital stays selectable, this is just a heads-up */}
                          {selectedVaccineName && h.vaccineInStock === false && (
                            <span className="badge-out-of-stock">Out of Stock</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="hospital-view-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewHospital(h);
                          }}
                        >
                          View Hospital
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>

          {viewHospital && (
            <HospitalModal
              hospital={viewHospital}
              onClose={() => setViewHospital(null)}
              onRate={handleRateHospital}
            />
          )}

          {/* ===== Payment Details ===== */}
<div className={`payment-section ${formData.serviceType === "government" ? "payment-hidden" : ""}`}>
  <h2 className="section-title">
    <CreditCard size={20} />
    Payment Details
  </h2>
  <div className="payment-card">
    {(() => {
      const selectedHospital = hospitals.find((h) => h._id === formData.hospital);
      if (!selectedHospital) {
        return (
          <p className="hint-text" style={{ textAlign: "center", padding: "20px 0" }}>
            Payment details will be available once you select a hospital.
          </p>
        );
      }
      const amount =
        formData.requestType === "home"
          ? selectedHospital.homeVisitCharges
          : selectedHospital.hospitalVisitCharges;
      return (
        <div className="payment-row total">
          <span className="payment-label">
            {formData.requestType === "home" ? "Home Visit Fee" : "Hospital Visit Fee"}
          </span>
          <span className="payment-amount">Rs. {amount}</span>
        </div>
      );
    })()}
  </div>
</div>

          {submitError && (
            <p className="hint-text" style={{ color: "#b91c1c", textAlign: "center" }}>
              {submitError}
            </p>
          )}

          {/* ===== Auto Schedule ===== */}
          <h2 className="section-title">
            <Calendar size={20} />
            Schedule
          </h2>

          <div className="auto-schedule-card">
            <div className="auto-schedule-info">
              <h3>Auto Schedule</h3>
              <p>
                Enable this to automatically schedule vaccination appointments
                based on your child's age and recommended vaccine timeline.
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="autoSchedule"
                checked={formData.autoSchedule}
                onChange={handleChange}
                disabled={isIneligibleForSchedule}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* ===== Section 4: Documents Upload ===== */}
          <h2 className="section-title">Upload Documents</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="field-label">Child Picture</label>
              <div
                className="upload-box"
                onClick={() =>
                  document.getElementById("childPicInput").click()
                }
              >
                <UploadCloud size={28} className="upload-icon" />
                <p>
                  <span className="upload-link">Click to upload</span> or drag
                  and drop
                </p>
                <span className="upload-info">PNG, JPG (MAX. 800x400px)</span>
                <input
                  type="file"
                  id="childPicInput"
                  accept=".png,.jpg,.jpeg,.gif"
                  onChange={(e) => setChildPicture(e.target.files[0])}
                  hidden
                />
                {childPicture && (
                  <p className="file-name">{childPicture.name}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                Birth Certificate{" "}
                <span className="optional-tag">(Optional)</span>
              </label>
              <div
                className="upload-box"
                onClick={() =>
                  document.getElementById("birthCertInput").click()
                }
              >
                <UploadCloud size={28} className="upload-icon" />
                <p>
                  <span className="upload-link">Click to upload</span> or drag
                  and drop
                </p>
                <span className="upload-info">PDF, DOCX, PNG (MAX. 5MB)</span>
                <input
                  type="file"
                  id="birthCertInput"
                  accept=".pdf,.docx,.png,.jpg"
                  onChange={(e) => setBirthCertificate(e.target.files[0])}
                  hidden
                />
                {birthCertificate && (
                  <p className="file-name">{birthCertificate.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddChild;