import React, { useState, useEffect } from "react";
import "./ManageSchedule.css";
import hospitalImg from "../../../assets/HDashboard.jpeg";
import "../../../styles/Hospitalshared.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import {
  Search,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Syringe,
  RotateCcw,
  Check,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const ManageSchedule = () => {
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [dateDrafts, setDateDrafts] = useState({}); // { scheduleItemId: "2026-08-01" }

  const fetchChildren = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/hospital/children-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load requests.");
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

  const handleDraftChange = (scheduleItemId, value) => {
    setDateDrafts((prev) => ({ ...prev, [scheduleItemId]: value }));
  };

  // ===== Save the manually-entered date for a vaccine =====
  const handleSaveDate = async (childId, scheduleItemId) => {
    const value = dateDrafts[scheduleItemId];
    if (!value) {
      setActionError("Please select a date first.");
      return;
    }
    setActionError("");
    try {
      const res = await fetch(
        `${API_BASE}/hospital/children-requests/${childId}/schedule/${scheduleItemId}/set-date`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dueDate: value }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.message || "Failed to save date.");
        return;
      }
      setChildren((prev) =>
        prev.map((c) => (c._id === childId ? result.child : c))
      );
      setDateDrafts((prev) => {
        const next = { ...prev };
        delete next[scheduleItemId];
        return next;
      });
    } catch (err) {
      console.error(err);
      setActionError("Server error. Please try again later.");
    }
  };

  // ===== Mark a single vaccine as given (only allowed once its date is set) =====
  const handleMarkGiven = async (childId, scheduleItemId) => {
    setActionError("");
    try {
      const res = await fetch(
        `${API_BASE}/hospital/children-requests/${childId}/schedule/${scheduleItemId}/mark-given`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.message || "Failed to mark vaccine as given.");
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

  const handleUndo = async (childId, scheduleItemId) => {
    setActionError("");
    try {
      const res = await fetch(
        `${API_BASE}/hospital/children-requests/${childId}/schedule/${scheduleItemId}/undo`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.message || "Failed to undo.");
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

  const calcAge = (dob) => {
    if (!dob) return "—";
    const diffMs = Date.now() - new Date(dob).getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    if (years < 1) return `${Math.floor(years * 12)} months`;
    return `${Math.floor(years)} years`;
  };

  const approvedChildren = children
    .filter((c) => c.status === "Approved")
    .filter((c) => c.childName.toLowerCase().includes(search.toLowerCase()));

  return (
    <HospitalLayout activeModule="schedule" topbarTitle="Manage Schedule">
      <section className="hospital-page-hero">
        <img src={hospitalImg} alt="" className="hospital-page-hero-img" />
        <div className="hospital-page-hero-overlay"></div>
        <div className="hospital-page-hero-content">
          <h1>Child Vaccination Schedule</h1>
          <p>Set each vaccine's date, then mark it as given once administered.</p>
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

            <h2 className="section-title">Manage Schedule</h2>

            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search child by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            {approvedChildren.length === 0 ? (
              <div className="empty-state">
                No approved children yet. Approve a request from View
                Appointments to start managing their schedule.
              </div>
            ) : (
              approvedChildren.map((child) => {
                // ✅ the "current" vaccine — the first one not yet marked as given
                const currentIdx = (child.schedule || []).findIndex(
                  (s) => s.status !== "Completed"
                );

                return (
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
                          Age: {calcAge(child.dateOfBirth)} | Guardian:{" "}
                          {child.guardianName} | {child.parent?.phone || "—"}
                        </p>
                      </div>
                      <div className="child-meta">
                        <span className="vaccine-count">
                          {child.schedule?.length || 0} Vaccines
                        </span>
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
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {child.schedule.map((v, idx) => {
                                  const isCurrent =
                                    v.status !== "Completed" && idx === currentIdx;

                                  return (
                                    <tr
                                      key={v._id}
                                      className={
                                        v.status === "Completed" ? "row-given" : ""
                                      }
                                    >
                                      <td>{idx + 1}</td>
                                      <td>
                                        <span className="vaccine-name-cell">
                                          <Syringe size={14} color="#1e5f8e" />{" "}
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
                                          : "Not set"}
                                      </td>
                                      <td>
                                        {v.status === "Completed" ? (
                                          <div className="action-btns">
                                            <span className="btn-mark btn-mark-done">
                                              <CheckCircle size={14} /> Marked
                                            </span>
                                            <button
                                              className="btn-undo-sm"
                                              onClick={() =>
                                                handleUndo(child._id, v._id)
                                              }
                                            >
                                              <RotateCcw size={13} /> Undo
                                            </button>
                                          </div>
                                        ) : isCurrent ? (
                                          v.dueDate ? (
                                            <button
                                              className="btn-mark"
                                              onClick={() =>
                                                handleMarkGiven(child._id, v._id)
                                              }
                                            >
                                              <CheckCircle size={14} /> Mark Given
                                            </button>
                                          ) : (
                                            <div className="action-btns">
                                              <input
                                                type="date"
                                                className="next-date-input"
                                                value={dateDrafts[v._id] || ""}
                                                onChange={(e) =>
                                                  handleDraftChange(
                                                    v._id,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <button
                                                className="btn-mark"
                                                onClick={() =>
                                                  handleSaveDate(child._id, v._id)
                                                }
                                              >
                                                <Check size={14} /> Save Date
                                              </button>
                                            </div>
                                          )
                                        ) : null}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
      <Footer />
    </HospitalLayout>
  );
};

export default ManageSchedule;