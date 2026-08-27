import React, { useState, useEffect } from "react";
import "./ManageRatings.css";
import "../../../styles/AdminShared.css";
import Footer from "../../../components/Footer/Footer";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import {
  Star, Search, AlertTriangle, Trash2, X,
  User, Phone, Mail, Building2, MapPin, ShieldOff,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const StarDisplay = ({ rating }) => (
  <div className="star-display">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={16}
        fill={s <= rating ? "#f59e0b" : "none"}
        color={s <= rating ? "#f59e0b" : "#d1d5db"} />
    ))}
  </div>
);

const ManageRatings = () => {
  const token = localStorage.getItem("token");

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [rejectModal, setRejectModal] = useState(null); // ✅ hospital being confirmed for rejection

  // ✅ Fetch real ratings from backend
  const fetchRatings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load ratings.");
        return;
      }
      setRatings(data);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line
  }, []);

  // ✅ Real backend call — DELETE /api/admin/ratings/:hospitalId/:ratingId
  const removeRating = async (r) => {
    try {
      const res = await fetch(`${API_BASE}/admin/ratings/${r.hospitalId}/${r.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to remove review.");
        return;
      }
      setRatings((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // ✅ Real backend call — reuses the EXISTING reject-hospital route
  // (the same one used to reject pending hospital signups)
  const rejectHospital = async (hospitalId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reject-hospital/${hospitalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to reject hospital.");
        return;
      }
      // ✅ that hospital's reviews no longer apply — remove them from this list too
      setRatings((prev) => prev.filter((r) => r.hospitalId !== hospitalId));
      setRejectModal(null);
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const filtered = ratings
    .filter(r => {
      if (filter === "Low")  return r.rating <= 2;
      if (filter === "Good") return r.rating >= 3;
      return true;
    })
    .filter(r =>
      r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital.name.toLowerCase().includes(search.toLowerCase())
    );

  const avgRating = ratings.length
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <AdminLayout activeModule="ratings" topbarTitle="Manage Ratings">

      {/* Hero */}
      <section className="admin-page-hero">
        <div className="admin-page-hero-overlay" />
        <div className="admin-page-hero-content">
          <h1>Manage Ratings</h1>
          <p>Monitor user feedback across all hospitals.</p>
        </div>
      </section>

      <div className="manage-content">

        {/* Stats */}
        <div className="rating-stats">
          {[
            { label: "Total Reviews", value: ratings.length,                              color: "#1e5f8e", bg: "#e8f1fc" },
            { label: "Average Rating", value: avgRating + " ★",                           color: "#b45309", bg: "#fdf0d5" },
            { label: "Low Ratings ≤2★", value: ratings.filter(r => r.rating <= 2).length, color: "#dc2626", bg: "#fde8e8" },
            { label: "Good Ratings ≥3★", value: ratings.filter(r => r.rating >= 3).length,color: "#0f6e56", bg: "#e0f5f3" },
          ].map(s => (
            <div className="r-stat-card" key={s.label} style={{ borderLeft: `4px solid ${s.color}`, background: s.bg }}>
              <h3 style={{ color: s.color }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="manage-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input className="search-input" placeholder="Search by user or hospital..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-row">
            {["All", "Low", "Good"].map(f => (
              <button key={f}
                className={`filter-btn ${filter === f ? "filter-active" : ""}`}
                onClick={() => setFilter(f)}>
                {f === "Low" ? "Low ≤2★" : f === "Good" ? "Good ≥3★" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="empty-state">Loading ratings...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No ratings found.</div>
        ) : (
          <div className="ratings-list">
            {filtered.map(r => (
              <div key={r.id} className={`rating-card ${r.rating <= 2 ? "rating-card-low" : ""}`}>

                {r.rating <= 2 && (
                  <div className="low-alert">
                    <AlertTriangle size={14} /> Low rating
                  </div>
                )}

                <div className="rating-card-body">

                  <div className="rating-top">
                    <StarDisplay rating={r.rating} />
                    <span className="rating-date">{r.date}</span>
                  </div>

                  {r.comment && <p className="rating-comment">"{r.comment}"</p>}

                  <div className="rating-details-grid">
                    <div className="rating-detail-block">
                      <p className="block-title"><User size={13} /> User</p>
                      <div className="detail-item"><User size={13} className="detail-icon" /><div><span className="detail-label">Name</span><span className="detail-value">{r.user.name}</span></div></div>
                      <div className="detail-item"><Phone size={13} className="detail-icon" /><div><span className="detail-label">Phone</span><span className="detail-value">{r.user.phone}</span></div></div>
                      <div className="detail-item"><Mail size={13} className="detail-icon" /><div><span className="detail-label">Email</span><span className="detail-value">{r.user.email}</span></div></div>
                    </div>
                    <div className="rating-detail-block">
                      <p className="block-title"><Building2 size={13} /> Hospital</p>
                      <div className="detail-item"><Building2 size={13} className="detail-icon" /><div><span className="detail-label">Name</span><span className="detail-value">{r.hospital.name}</span></div></div>
                      <div className="detail-item"><MapPin size={13} className="detail-icon" /><div><span className="detail-label">Address</span><span className="detail-value">{r.hospital.address}</span></div></div>
                      <div className="detail-item">
                        <span className={`type-pill ${r.hospital.type === "Government" ? "pill-gov" : "pill-priv"}`}>{r.hospital.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rating-actions">
                    {r.rating <= 2 && (
                      <button className="btn-suspend-full" style={{ flex: "none", padding: "8px 16px" }}
                        onClick={() => setRejectModal(r)}>
                        <ShieldOff size={14} /> Reject Hospital
                      </button>
                    )}
                    <button className="btn-delete-full" style={{ flex: "none", padding: "8px 16px" }}
                      onClick={() => removeRating(r)}>
                      <Trash2 size={14} /> Remove Review
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />

      {/* Reject Hospital Confirmation Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRejectModal(null)}><X size={18} /></button>
            <div className="modal-icon">
              <ShieldOff size={28} color="#ef4444" />
            </div>
            <h3>Reject Hospital?</h3>
            <p>
              <strong>{rejectModal.hospital.name}</strong> will be permanently removed
              due to its low rating of <strong>{rejectModal.rating}★</strong>. This
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn-danger-solid" onClick={() => rejectHospital(rejectModal.hospitalId)}>
                Reject Hospital
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageRatings;