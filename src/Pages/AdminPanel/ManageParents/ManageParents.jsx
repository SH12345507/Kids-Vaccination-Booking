import React, { useState, useEffect } from "react";
import "./ManageParents.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout from "../../../Components/AdminLayout/AdminLayout";
import {
  Users, Search, Eye, Trash2, X,
  User, Mail, Phone, Baby, Syringe, Calendar, FileText,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const calcAge = (dob) => {
  if (!dob) return "—";
  const diffMs = Date.now() - new Date(dob).getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 1) return `${Math.floor(years * 12)} months`;
  return `${Math.floor(years)} years`;
};

const ManageParents = () => {
  const token = localStorage.getItem("token");

  const [parents, setParents]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  // ✅ Fetch real parents (with their children + pictures) from backend
  const fetchParents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/parents-with-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load parents.");
        return;
      }
      // ✅ split single "name" field into first/last for this UI
      setParents(
        data.map((p) => {
          const parts = (p.name || "").split(" ");
          return {
            id: p._id,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            username: p.email ? p.email.split("@")[0] : "",
            email: p.email,
            whatsapp: p.phone,
            children: p.children || [],
          };
        })
      );
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
    // eslint-disable-next-line
  }, []);

  // ✅ Real backend call — DELETE /api/admin/parents/:parentId
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/parents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete parent.");
        return;
      }
      setParents((prev) => prev.filter((p) => p.id !== id));
      setSelected(null);
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const filtered = parents.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email} ${p.username}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout activeModule="parents" topbarTitle="Manage Parents">

      <section className="admin-page-hero">
        <div className="admin-page-hero-overlay" />
        <div className="admin-page-hero-content">
          <h1>Manage Parents</h1>
          <p>View all registered parents, their details and children's profiles.</p>
        </div>
      </section>

      <div className="manage-content">

        {/* Stats */}
        <div className="parent-stats">
          <div className="p-stat-card" style={{ borderLeft: "4px solid #1e5f8e", background: "#e8f1fc" }}>
            <h3 style={{ color: "#1e5f8e" }}>{parents.length}</h3>
            <p>Total Parents</p>
          </div>
          <div className="p-stat-card" style={{ borderLeft: "4px solid #0d9488", background: "#e0f5f3" }}>
            <h3 style={{ color: "#0d9488" }}>
              {parents.reduce((a, p) => a + (p.children?.length || 0), 0)}
            </h3>
            <p>Total Children</p>
          </div>
        </div>

        {/* Search */}
        <div className="manage-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input className="search-input" placeholder="Search by name, email or username..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div className="empty-state">Loading parents...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No parents found.</div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Children</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id}>
                      <td>{idx + 1}</td>
                      <td><span className="p-name">{p.firstName} {p.lastName}</span></td>
                      <td>@{p.username}</td>
                      <td>{p.email}</td>
                      <td>{p.whatsapp}</td>
                      <td><span className="children-count">{p.children?.length || 0} children</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-info" onClick={() => setSelected(p)}>
                            <Eye size={13} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={13} />
                          </button>
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

      {/* ===== Parent Detail Modal ===== */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button>

            <div className="detail-header">
              <div className="detail-avatar"><User size={28} color="#1e5f8e" /></div>
              <div>
                <h3>{selected.firstName} {selected.lastName}</h3>
                <span className="username-tag">@{selected.username}</span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <Mail size={15} className="detail-icon" />
                <div>
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selected.email || "—"}</span>
                </div>
              </div>
              <div className="detail-item">
                <Phone size={15} className="detail-icon" />
                <div>
                  <span className="detail-label">WhatsApp</span>
                  <span className="detail-value">{selected.whatsapp || "—"}</span>
                </div>
              </div>
            </div>

            {selected.children?.length > 0 && (
              <div className="children-list">
                <h4><Baby size={14} color="#1e5f8e" /> Children — click to view profile</h4>
                {selected.children.map((child) => (
                  <div className="child-row clickable" key={child.id}
                    onClick={() => { setSelectedChild(child); setSelected(null); }}>
                    <Baby size={14} color="#1e5f8e" />
                    <span className="child-name">{child.name || "—"}</span>
                    <span className="child-age">{calcAge(child.dob)}</span>
                    <Eye size={13} color="#94a3b8" style={{ marginLeft: "auto" }} />
                  </div>
                ))}
              </div>
            )}

            <div className="detail-actions">
              <button className="btn-delete-full" onClick={() => handleDelete(selected.id)}>
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Child Detail Modal ===== */}
      {selectedChild && (
        <div className="modal-overlay" onClick={() => setSelectedChild(null)}>
          <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedChild(null)}><X size={18} /></button>

            <div className="detail-header">
              {/* ✅ Real photo if uploaded, otherwise the fallback icon avatar */}
              {selectedChild.picture ? (
                <img
                  src={selectedChild.picture}
                  alt={selectedChild.name}
                  style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div className="detail-avatar"><Baby size={28} color="#0d9488" /></div>
              )}
              <div>
                <h3>{selectedChild.name || "—"}</h3>
                <span className="username-tag">{calcAge(selectedChild.dob)}</span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <Calendar size={15} className="detail-icon" />
                <div>
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">
                    {selectedChild.dob ? new Date(selectedChild.dob).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <User size={15} className="detail-icon" />
                <div>
                  <span className="detail-label">Hospital</span>
                  <span className="detail-value">{selectedChild.hospital || "—"}</span>
                </div>
              </div>
            </div>

            {/* ✅ Birth certificate link, if one was uploaded */}
            {selectedChild.birthCertificate && (
              <a
                href={selectedChild.birthCertificate}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, textDecoration: "none" }}
              >
                <FileText size={14} /> View Birth Certificate
              </a>
            )}

            {/* Vaccine Records */}
            <div className="children-list">
              <h4><Syringe size={14} color="#1e5f8e" /> Vaccination Records</h4>
              {selectedChild.vaccines?.length > 0 ? (
                selectedChild.vaccines.map((v, idx) => (
                  <div className="vaccine-row" key={idx}>
                    <Syringe size={13} color="#1e5f8e" />
                    <span className="child-name">{v.name || "—"}</span>
                    <span className="child-age">{v.dateGiven || "—"}</span>
                    <span className={`status-badge ${v.status === "Completed" ? "badge-approved" : "badge-pending"}`}>
                      {v.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-vaccines">No vaccination records yet.</p>
              )}
            </div>

            <div className="detail-actions">
              <button className="btn-secondary" onClick={() => setSelectedChild(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default ManageParents;