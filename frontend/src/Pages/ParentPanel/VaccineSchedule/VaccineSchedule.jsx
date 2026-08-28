import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VaccineSchedule.css";
import PDashboardimg from "../../../assets/PDashboard.jpeg";
import Footer from "../../../components/Footer/Footer";
import ParentLayout from "../../../components/ParentLayout/ParentLayout";
import {
  CalendarCheck,
  FileText,
  UserPlus,
  Syringe,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import HospitalModal from "../Hospitalmodal/HospitalModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const VaccineSchedule = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("schedule");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [viewHospital, setViewHospital] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/parent/my-children`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load your children.");
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

    fetchChildren();
    // eslint-disable-next-line
  }, []);

  const pendingApproval = children.filter((c) => c.status === "Pending");

  // ✅ Upcoming Schedule — approved children whose schedule is NOT fully completed yet
  const approvedChildren = children.filter(
    (c) => c.status === "Approved" && !c.scheduleCompleted
  );

  // ✅ Records — approved children whose full schedule IS completed (moved here entirely)
  const records = children.filter(
    (c) => c.status === "Approved" && c.scheduleCompleted
  );

  // ✅ Submit/update a rating for a hospital, then refresh it everywhere it appears
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
        setChildren((prev) =>
          prev.map((c) =>
            c.hospital?._id === hospitalId
              ? { ...c, hospital: { ...c.hospital, averageRating: result.averageRating } }
              : c
          )
        );
        setViewHospital((prev) =>
          prev ? { ...prev, averageRating: result.averageRating } : prev
        );
      } else {
        alert(result.message || "Failed to submit rating.");
      }
    } catch (err) {
      console.error("Failed to submit rating:", err);
    }
  };

  return (
    <ParentLayout topbarTitle="Vaccine Overview">
      <div className="schedule-wrapper">
        {/* Hero Section */}
        <section className="schedule-hero">
          <img src={PDashboardimg} alt="" className="schedule-hero-img" />
          <div className="schedule-hero-overlay"></div>
          <div className="schedule-hero-content">
            <h1>Vaccine Schedule & Records</h1>
            <p>
              Track upcoming vaccinations and view your child's complete
              vaccination history, all in one place.
            </p>
          </div>
        </section>

        {loading ? (
          <p className="hint-text">Loading...</p>
        ) : error ? (
          <p className="hint-text" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        ) : children.length === 0 ? (
          /* ===== No children registered at all ===== */
          <div className="empty-state form-card">
            <Syringe size={48} color="#94a3b8" />
            <h2>No Schedule Found</h2>
            <p>
              You have not registered any children yet. Register a child
              to see their upcoming vaccine schedule here.
            </p>
            <button className="btn-primary" onClick={() => navigate("/add-child")}>
              <UserPlus size={18} />
              Register a Child
            </button>
          </div>
        ) : (
          <>
            {/* ===== Requests awaiting hospital approval ===== */}
            {pendingApproval.length > 0 && (
              <div className="pending-approval-banner">
                <Clock size={20} />
                <div>
                  <h4>Awaiting Hospital Approval</h4>
                  <p>
                    {pendingApproval.map((c) => c.childName).join(", ")}
                    {pendingApproval.length === 1 ? "'s" : "'"} registration
                    {pendingApproval.length === 1 ? " is" : "s are"} still
                    pending review. The vaccine schedule will appear here
                    once the hospital approves the request.
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="schedule-tabs">
              <button
                className={`schedule-tab ${activeTab === "schedule" ? "active" : ""}`}
                onClick={() => setActiveTab("schedule")}
              >
                <CalendarCheck size={18} />
                Upcoming Schedule
              </button>
              <button
                className={`schedule-tab ${activeTab === "records" ? "active" : ""}`}
                onClick={() => setActiveTab("records")}
              >
                <FileText size={18} />
                Records
              </button>
            </div>

            {/* Upcoming Schedule Tab — one dropdown card per approved child */}
            {activeTab === "schedule" && (
              <>
                {approvedChildren.length === 0 ? (
                  <div className="empty-state form-card">
                    <Syringe size={48} color="#94a3b8" />
                    <h2>No Approved Children Yet</h2>
                    <p>
                      The schedule will show up here once a hospital
                      approves a registration.
                    </p>
                  </div>
                ) : (
                  approvedChildren.map((child) => (
                    <div className="child-card" key={child._id}>
                      <div
                        className="child-header"
                        onClick={() =>
                          setExpandedId(expandedId === child._id ? null : child._id)
                        }
                      >
                        <div className="child-avatar">
                          {child.childName ? child.childName.charAt(0) : "?"}
                        </div>
                        <div className="child-info">
                          <h3>{child.childName}</h3>
                          <p>{child.hospital?.name || "—"}</p>
                        </div>
                        <div className="child-meta">
                          <span className="vaccine-count">
                            {child.schedule?.length || 0} Vaccines
                          </span>
                          {child.hospital && (
                            <button
                              type="button"
                              className="view-hospital-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewHospital(child.hospital);
                              }}
                            >
                              <Eye size={14} /> View Hospital
                            </button>
                          )}
                          {expandedId === child._id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>

                      {expandedId === child._id && (
                        <div className="vaccine-section">
                          {!child.schedule || child.schedule.length === 0 ? (
                            <p className="hint-text">
                              Auto-schedule was not enabled for this child.
                            </p>
                          ) : (
                            <div className="table-scroll">
                              <table className="schedule-table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Vaccine</th>
                                    <th>Recommended Age</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {child.schedule.map((v, idx) => (
                                    <tr
                                      key={v._id}
                                      className={
                                        v.status === "Completed" ? "row-given" : ""
                                      }
                                    >
                                      <td>{idx + 1}</td>
                                      <td>
                                        <span className="vaccine-name-cell">
                                          <Syringe size={14} color="#0d9488" />{" "}
                                          {v.vaccine?.name || "—"}
                                        </span>
                                      </td>
                                      <td>{v.vaccine?.ageLabel || "—"}</td>
                                      <td>
                                        <span
                                          className={`status-badge ${
                                            v.status === "Completed"
                                              ? "status-given"
                                              : "status-pending"
                                          }`}
                                        >
                                          {v.status}
                                        </span>
                                      </td>
                                      <td>
                                        {v.status === "Completed"
                                          ? v.completedDate
                                            ? `Given on ${new Date(
                                                v.completedDate
                                              ).toLocaleDateString()}`
                                            : "—"
                                          : v.dueDate
                                          ? new Date(v.dueDate).toLocaleDateString()
                                          : "Not set yet"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {/* Records Tab — same expandable card layout, but for fully-completed children */}
            {activeTab === "records" && (
              <>
                {records.length === 0 ? (
                  <div className="empty-state form-card">
                    <FileText size={48} color="#94a3b8" />
                    <h2>No Records Yet</h2>
                    <p>
                      Once your child's vaccination record is completed,
                      then the record will appear here.
                    </p>
                  </div>
                ) : (
                  records.map((child) => (
                    <div className="child-card" key={child._id}>
                      <div
                        className="child-header"
                        onClick={() =>
                          setExpandedId(expandedId === child._id ? null : child._id)
                        }
                      >
                        <div className="child-avatar">
                          {child.childName ? child.childName.charAt(0) : "?"}
                        </div>
                        <div className="child-info">
                          <h3>{child.childName}</h3>
                          <p>
                            {child.hospital?.name || "—"} &middot; DOB:{" "}
                            {child.dateOfBirth
                              ? new Date(child.dateOfBirth).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                        <div className="child-meta">
                          <span className="vaccine-count status-given">Completed</span>
                          {child.hospital && (
                            <button
                              type="button"
                              className="view-hospital-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewHospital(child.hospital);
                              }}
                            >
                              <Eye size={14} /> View Hospital
                            </button>
                          )}
                          {expandedId === child._id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>

                      {expandedId === child._id && (
                        <div className="vaccine-section">
                          <div className="table-scroll">
                            <table className="schedule-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Vaccine</th>
                                  <th>Recommended Age</th>
                                  <th>Status</th>
                                  <th>Given On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(child.schedule || []).map((v, idx) => (
                                  <tr key={v._id} className="row-given">
                                    <td>{idx + 1}</td>
                                    <td>
                                      <span className="vaccine-name-cell">
                                        <Syringe size={14} color="#0d9488" />{" "}
                                        {v.vaccine?.name || "—"}
                                      </span>
                                    </td>
                                    <td>{v.vaccine?.ageLabel || "—"}</td>
                                    <td>
                                      <span className="status-badge status-given">
                                        {v.status}
                                      </span>
                                    </td>
                                    <td>
                                      {v.completedDate
                                        ? new Date(v.completedDate).toLocaleDateString()
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>

      <Footer />

      {viewHospital && (
        <HospitalModal
          hospital={viewHospital}
          onClose={() => setViewHospital(null)}
          onRate={handleRateHospital}
        />
      )}
    </ParentLayout>
  );
};

export default VaccineSchedule;