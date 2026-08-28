import React, { useState, useEffect } from "react";
import "./ViewAppointments.css";
import hospitalImg from "../../../assets/HDashboard.jpeg";
import "../../../styles/Hospitalshared.css";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import Footer from "../../../Components/Footer/Footer";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  MapPin,
  IdCard,
  Home,
  Building2,
  RotateCcw,
  FileText,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const ViewAppointments = () => {
  const token = localStorage.getItem("token");
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchChildren = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/hospital/children-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load appointment requests.");
        return;
      }
      setChildren(data);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line
  }, []);

  const calcAge = (dob) => {
    if (!dob) return "—";
    const diffMs = Date.now() - new Date(dob).getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    if (years < 1) return `${Math.floor(years * 12)} months`;
    return `${Math.floor(years)} years`;
  };

  const updateStatus = async (childId, action) => {
    setActionError("");
    try {
      const res = await fetch(
        `${API_BASE}/hospital/children-requests/${childId}/${action}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.message || "Action failed.");
        return;
      }
      setChildren((prev) =>
        prev.map((c) => (c._id === childId ? result.child : c))
      );
    } catch (err) {
      console.error(err);
      setActionError("Server error. Please try again later.");
    }
  };

  const handleApprove = (childId) => updateStatus(childId, "approve");
  const handleReject = (childId) => updateStatus(childId, "reject");
  const handleUndo = (childId) => updateStatus(childId, "revert");

  const filtered =
    filterStatus === "All"
      ? children
      : children.filter((c) => c.status === filterStatus);

  return (
    <HospitalLayout activeModule="appointments" topbarTitle="View Appointments">
      {/* Hero */}
      <section className="hospital-page-hero hospital-page-hero-tall">
        <img src={hospitalImg} alt="" className="hospital-page-hero-img" />
        <div className="hospital-page-hero-overlay"></div>
        <div className="hospital-page-hero-content">
          <h1>Appointment Requests</h1>
          <p>Review, approve or reject incoming vaccination registrations.</p>
        </div>
      </section>

      <div className="page-content">
        {loading ? (
          <p className="hint-text">Loading...</p>
        ) : error ? (
          <p className="hint-text" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        ) : (
          <>
            {actionError && (
              <p className="hint-text" style={{ color: "#b91c1c" }}>
                {actionError}
              </p>
            )}

            {/* Filter */}
            <div className="page-filter">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filterStatus === f ? "filter-active" : ""}`}
                  onClick={() => setFilterStatus(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Requests */}
            {filtered.length === 0 ? (
              <div className="empty-state">No requests found.</div>
            ) : (
              filtered.map((child, idx) => (
                <div className="appt-card" key={child._id}>
                  <div
                    className="appt-row"
                    onClick={() =>
                      setExpandedId(expandedId === child._id ? null : child._id)
                    }
                  >
                    <div className="appt-num">#{idx + 1}</div>

                    <div className="appt-avatar">
                      {child.childPicture ? (
                        <img src={child.childPicture} alt={child.childName} />
                      ) : (
                        <span>{child.childName ? child.childName.charAt(0) : "?"}</span>
                      )}
                    </div>

                    <div className="appt-summary">
                      <h3>{child.childName || "—"}</h3>
                      <p>
                        {child.serviceType || "—"} &nbsp;|&nbsp; {child.requestType || "—"} visit
                        &nbsp;|&nbsp; Registered{" "}
                        {child.createdAt
                          ? new Date(child.createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <div className="appt-right">
                      <span
                        className={`appt-status
                          ${child.status === "Approved" ? "status-approved" :
                            child.status === "Rejected" ? "status-rejected" : "status-pending"}`}
                      >
                        {child.status}
                      </span>
                      {expandedId === child._id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>

                  {expandedId === child._id && (
                    <div className="appt-details">
                      {/* Photo + Documents */}
                      <div className="appt-photo-row">
                        <div className="appt-photo-box">
                          {child.childPicture ? (
                            <img src={child.childPicture} alt={child.childName} />
                          ) : (
                            <span className="no-photo">No photo uploaded</span>
                          )}
                        </div>
                        {child.birthCertificate && (
                          <a
                            href={child.birthCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-undo"
                          >
                            <FileText size={14} /> View Birth Certificate
                          </a>
                        )}
                      </div>

                      <div className="details-grid">
                        {[
                          { icon: <User size={15} />, label: "Child Name", value: child.childName },
                          { icon: <Clock size={15} />, label: "Age", value: calcAge(child.dateOfBirth) },
                          {
                            icon: <Clock size={15} />,
                            label: "Date of Birth",
                            value: child.dateOfBirth
                              ? new Date(child.dateOfBirth).toLocaleDateString()
                              : "—",
                          },
                          { icon: <User size={15} />, label: "Guardian Name", value: child.guardianName },
                          { icon: <IdCard size={15} />, label: "Guardian CNIC", value: child.guardianCnic },
                          { icon: <Phone size={15} />, label: "Phone", value: child.parent?.phone },
                          { icon: <MapPin size={15} />, label: "Address", value: child.address },
                          {
                            icon: <Building2 size={15} />,
                            label: "Service Type",
                            value: child.serviceType,
                          },
                          {
                            icon: <Home size={15} />,
                            label: "Request Type",
                            value: child.requestType,
                          },
                          {
                            icon: <ClipboardList size={15} />,
                            label: "Auto Schedule",
                            value: child.autoSchedule ? "Enabled" : "Not Enabled",
                          },
                        ].map((item, i) => (
                          <div className="detail-item" key={i}>
                            <span className="detail-icon">{item.icon}</span>
                            <div>
                              <span className="detail-label">{item.label}</span>
                              <span className="detail-value">{item.value || "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {child.status === "Pending" && (
                        <div className="appt-actions">
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(child._id)}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(child._id)}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}

                      {child.status !== "Pending" && (
                        <div className="appt-actions">
                          <span
                            className={`final-status ${
                              child.status === "Approved" ? "status-approved" : "status-rejected"
                            }`}
                          >
                            {child.status === "Approved" ? (
                              <CheckCircle size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Request {child.status}
                          </span>
                          <button className="btn-undo" onClick={() => handleUndo(child._id)}>
                            <RotateCcw size={14} /> Undo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
      <Footer />
    </HospitalLayout>
  );
};

export default ViewAppointments;