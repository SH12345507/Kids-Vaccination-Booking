import React, { useState, useEffect } from "react";
import "./ManageHospitals.css";
import "../../../styles/Adminshared.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";
import {
  Hospital, Search, Eye, CheckCircle, XCircle,
  Trash2, ShieldOff, ShieldCheck, FileText, X,
  Phone, Mail, MapPin, Building2, CreditCard,
} from "lucide-react";

const STATUS_FILTERS = ["All", "Pending", "Approved"];
const DETAIL_TABS     = ["profile", "stock", "slots"];

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All");
  const [selected, setSelected]   = useState(null);
  const [certModal, setCertModal] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const token = localStorage.getItem("token");

  // ✅ Convert backend hospital object into the shape this UI expects
  const normalize = (h) => ({
    id: h._id,
    name: h.name || "",
    email: h.email || "",
    phone: h.phone || "",
    address: h.address || "",
    type: h.type || "",
    hospitalFee: h.hospitalVisitCharges ?? null,
    homeFee: h.homeVisitCharges ?? null,
    status: h.isApproved ? "Approved" : "Pending",
    certificate: h.certificate || "",
    stock: h.stock || [],
    slots: h.slots || [],
  });

  // ✅ Fetch real hospitals from backend
  const fetchHospitals = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/hospitals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load hospitals.");
        setLoading(false);
        return;
      }

      setHospitals(data.map(normalize));
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Approve — real backend call
  const approve = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approve-hospital/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setHospitals((h) => h.map((x) => (x.id === id ? { ...x, status: "Approved" } : x)));
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // ✅ Reject — real backend call (deletes the hospital record)
  const reject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reject-hospital/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setHospitals((h) => h.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  // ✅ Delete — same as reject on the backend (no separate delete route exists)
  const remove = async (id) => {
    await reject(id);
    setSelected(null);
  };

  const openDetail = (h) => { setSelected(h); setActiveTab("profile"); };

  const filtered = hospitals
    .filter(h => filter === "All" || h.status === filter)
    .filter(h =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase())
    );

  const statusBadgeClass = (s) =>
    s === "Approved" ? "badge-approved" : s === "Pending" ? "badge-pending" : "badge-suspended";

  return (
    <AdminLayout activeModule="hospitals" topbarTitle="Manage Hospitals">

      <section className="admin-page-hero">
        <div className="admin-page-hero-overlay" />
        <div className="admin-page-hero-content">
          <h1>Manage Hospitals</h1>
          <p>Review registration requests, verify certificates, and monitor all hospitals.</p>
        </div>
      </section>

      <div className="manage-content">

        <div className="manage-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input className="search-input" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-row">
            {STATUS_FILTERS.map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "filter-active" : ""}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="hospital-stats">
          {[
            { label: "Total",    count: hospitals.length,                                  color: "#1e5f8e", bg: "#e8f1fc" },
            { label: "Pending",  count: hospitals.filter(h => h.status === "Pending").length,  color: "#b45309", bg: "#fdf0d5" },
            { label: "Approved", count: hospitals.filter(h => h.status === "Approved").length, color: "#0f6e56", bg: "#e0f5f3" },
          ].map(s => (
            <div className="h-stat-card" key={s.label} style={{ borderLeft: `4px solid ${s.color}`, background: s.bg }}>
              <h3 style={{ color: s.color }}>{s.count}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="table-card">
          {loading ? (
            <div className="empty-state">Loading hospitals...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No hospitals found.</div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Hospital</th><th>Type</th><th>Contact</th>
                    <th>Fees</th><th>Certificate</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, idx) => (
                    <tr key={h.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="h-name-cell">
                          <span className="h-name">{h.name}</span>
                          <span className="h-email">{h.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-pill ${h.type === "Government" ? "pill-gov" : "pill-priv"}`}>
                          {h.type}
                        </span>
                      </td>
                      <td>{h.phone}</td>
                      <td>
                        {h.type === "Government" ? (
                          <span className="free-tag">Free</span>
                        ) : (
                          <div className="fee-cell">
                            <span>Hospital {h.hospitalFee != null ? `Rs. ${h.hospitalFee}` : "N/A"}</span>
                            <span>Home {h.homeFee != null ? `Rs. ${h.homeFee}` : "N/A"}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <button className="btn-cert" onClick={() => setCertModal(h)}>
                          <FileText size={14} /> View
                        </button>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadgeClass(h.status)}`}>{h.status}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-info" onClick={() => openDetail(h)}><Eye size={13} /></button>
                          {h.status === "Pending" && (
                            <>
                              <button className="btn-approve" onClick={() => approve(h.id)}><CheckCircle size={13} /></button>
                              <button className="btn-reject"  onClick={() => reject(h.id)}><XCircle size={13} /></button>
                            </>
                          )}
                          <button className="btn-delete" onClick={() => remove(h.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />

      {/* ===== Detail Modal with Tabs ===== */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button>

            <div className="detail-header">
              <div className="detail-avatar"><Hospital size={28} color="#1e5f8e" /></div>
              <div>
                <h3>{selected.name || "—"}</h3>
                <span className={`status-badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span>
              </div>
            </div>

            <div className="detail-tabs">
              {DETAIL_TABS.map(t => (
                <button key={t} className={`filter-btn ${activeTab === t ? "filter-active" : ""}`}
                  onClick={() => setActiveTab(t)}>
                  {t === "profile" ? "Profile" : t === "stock" ? "Stock" : "Slots"}
                </button>
              ))}
            </div>

            {activeTab === "profile" && (
              <div className="detail-grid">
                <div className="detail-item"><Mail size={15} className="detail-icon" /><div><span className="detail-label">Email</span><span className="detail-value">{selected.email || "—"}</span></div></div>
                <div className="detail-item"><Phone size={15} className="detail-icon" /><div><span className="detail-label">Phone</span><span className="detail-value">{selected.phone || "—"}</span></div></div>
                <div className="detail-item"><MapPin size={15} className="detail-icon" /><div><span className="detail-label">Address</span><span className="detail-value">{selected.address || "—"}</span></div></div>
                <div className="detail-item"><Building2 size={15} className="detail-icon" /><div><span className="detail-label">Type</span><span className="detail-value">{selected.type || "—"}</span></div></div>
                {selected.type === "Private" && (
                  <div className="detail-item"><CreditCard size={15} className="detail-icon" /><div><span className="detail-label">Fees</span><span className="detail-value">
                    Hospital: {selected.hospitalFee != null ? `PKR ${selected.hospitalFee}` : "N/A"} | Home: {selected.homeFee != null ? `PKR ${selected.homeFee}` : "N/A"}
                  </span></div></div>
                )}
              </div>
            )}

            {activeTab === "stock" && (
              <div className="tab-content">
                {!selected.stock || selected.stock.length === 0 ? (
                  <p className="tab-empty">No stock data available.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table mini-table">
                      <thead><tr><th>#</th><th>Vaccine</th><th>Quantity</th><th>Status</th></tr></thead>
                      <tbody>
                        {selected.stock.map((s, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{s.name || "—"}</td>
                            <td>{s.quantity}</td>
                            <td>
                              <span className={`status-badge ${s.quantity <= 10 ? "badge-pending" : "badge-approved"}`}>
                                {s.quantity <= 10 ? "Low" : "OK"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "slots" && (
              <div className="tab-content">
                {!selected.slots || selected.slots.length === 0 ? (
                  <p className="tab-empty">No slots available.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table mini-table">
                      <thead><tr><th>Day</th><th>From</th><th>To</th><th>Type</th><th>Total</th><th>Booked</th></tr></thead>
                      <tbody>
                        {selected.slots.map((sl, idx) => (
                          <tr key={idx}>
                            <td>{sl.day || "—"}</td>
                            <td>{sl.timeFrom || "—"}</td>
                            <td>{sl.timeTo || "—"}</td>
                            <td>
                              <span className={`type-pill ${sl.type === "Home" ? "pill-priv" : "pill-gov"}`}>
                                {sl.type || "—"}
                              </span>
                            </td>
                            <td>{sl.totalSlots}</td>
                            <td>{sl.bookedSlots}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="detail-actions">
              {selected.status === "Pending" && (
                <>
                  <button className="btn-approve-full" onClick={() => { approve(selected.id); setSelected(null); }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="btn-reject-full" onClick={() => { reject(selected.id); setSelected(null); }}>
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
              <button className="btn-delete-full" onClick={() => remove(selected.id)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certModal && (
        <div className="modal-overlay" onClick={() => setCertModal(null)}>
          <div className="modal-card cert-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCertModal(null)}><X size={18} /></button>
            <div className="modal-icon" style={{ background: "#e8f1fc" }}>
              <FileText size={28} color="#1e5f8e" />
            </div>
            <h3>Verification Certificate</h3>
            <p><strong>{certModal.name}</strong></p>
            <div className="cert-preview">
              {certModal.certificate ? (
                <>
                  <FileText size={48} color="#1e5f8e" />
                  <p>Certificate uploaded</p>
                  <a
                    href={certModal.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upload-link"
                  >
                    View / Download Certificate
                  </a>
                </>
              ) : (
                <>
                  <FileText size={48} color="#94a3b8" />
                  <p>No certificate uploaded</p>
                </>
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              {certModal.status === "Pending" ? (
                <>
                  <button className="btn-approve-full" onClick={() => { approve(certModal.id); setCertModal(null); }}>
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button className="btn-reject-full" onClick={() => { reject(certModal.id); setCertModal(null); }}>
                    <XCircle size={15} /> Reject
                  </button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => setCertModal(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default ManageHospitals;
