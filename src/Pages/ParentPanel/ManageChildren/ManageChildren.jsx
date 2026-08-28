import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ParentShared.css";
import "./ManageChildren.css";
import Footer from "../../../components/Footer/Footer";
import ParentLayout from "../../../Components/ParentLayout/ParentLayout";
import {
  User, Users, MapPin, Pencil, Trash2,
  UserPlus, X, AlertTriangle, FileText, UploadCloud, Eye,
} from "lucide-react";

const ManageChildren = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingChildId, setEditingChildId] = useState(null);
  const [childEditData, setChildEditData] = useState({ name: "", dob: "", address: "" });
  const [newCertificate, setNewCertificate] = useState(null); // ✅ file picked while editing (may stay null)
  const [childToRemove, setChildToRemove] = useState(null);

  // ✅ Fetch real children from backend
  const fetchChildren = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/parent/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to load children.");
        return;
      }

      // ✅ Map backend field names (childName, dateOfBirth) to this UI's names (name, dob)
      setChildren(result.map((c) => ({
        id: c._id,
        name: c.childName,
        dob: c.dateOfBirth ? c.dateOfBirth.slice(0, 10) : "",
        address: c.address || "",
        birthCertificate: c.birthCertificate || "",
      })));
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line
  }, []);

  // ✅ Same age calculation as AddChild.jsx, so the displayed age is consistent
  const calcAge = (dob) => {
    if (!dob) return "—";
    const days = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24));
    const years = days / 365.25;
    if (years < 1) return `${Math.floor(days / 30.44)} months`;
    return `${Math.floor(years)} years`;
  };

  const startEdit = (child) => {
    setEditingChildId(child.id);
    setChildEditData({ name: child.name, dob: child.dob, address: child.address || "" });
    setNewCertificate(null);
  };

  const cancelEdit = () => {
    setEditingChildId(null);
    setNewCertificate(null);
  };

  // ✅ Real backend call — PUT /api/parent/children/:childId
  // Now sent as FormData so a replacement birth certificate can travel with it.
  const saveEdit = async (id) => {
    try {
      const data = new FormData();
      data.append("childName", childEditData.name);
      data.append("dateOfBirth", childEditData.dob);
      data.append("address", childEditData.address);
      if (newCertificate) {
        data.append("birthCertificate", newCertificate);
      }

      const response = await fetch(`http://localhost:5000/api/parent/children/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }, // ✅ no Content-Type — browser sets multipart boundary
        body: data,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update child.");
        return;
      }

      // ✅ Reflect the new certificate path returned by the backend (if changed)
      setChildren((prev) => prev.map((c) =>
        c.id === id
          ? { ...c, ...childEditData, birthCertificate: result.child?.birthCertificate || c.birthCertificate }
          : c
      ));
      setEditingChildId(null);
      setNewCertificate(null);
      setError("");
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const confirmRemoveChild = (child) => setChildToRemove(child);
  const closeRemoveModal = () => setChildToRemove(null);

  // ✅ Real backend call — DELETE /api/parent/children/:childId
  const handleRemoveConfirmed = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/parent/children/${childToRemove.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to remove child.");
        setChildToRemove(null);
        return;
      }

      setChildren((prev) => prev.filter((c) => c.id !== childToRemove.id));
      setChildToRemove(null);
    } catch (err) {
      setError("Server error. Please try again later.");
      setChildToRemove(null);
    }
  };

  return (
    <ParentLayout topbarTitle="Manage Children">
      <div className="settings-subpage-wrapper">
        <div className="form-card">

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <div className="empty-state">
              <p>Loading children...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="empty-state">
              <Users size={44} color="#94a3b8" />
              <h2>No Children Added</h2>
              <p>You haven't added any child profiles yet.</p>
              <button className="btn-primary" onClick={() => navigate("/add-child")}>
                <UserPlus size={18} /> Add a Child
              </button>
            </div>
          ) : (
            <>
              <div className="children-list">
                {children.map((child) =>
                  editingChildId === child.id ? (
                    <div className="child-edit-card" key={child.id}>
                      <div className="form-group">
                        <label className="field-label">Child Name</label>
                        <div className="input-group">
                          <User size={18} className="input-icon" />
                          <input type="text" value={childEditData.name}
                            onChange={(e) => setChildEditData({ ...childEditData, name: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="field-label">Date of Birth</label>
                        <div className="input-group">
                          <input type="date" value={childEditData.dob}
                            onChange={(e) => setChildEditData({ ...childEditData, dob: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="field-label">Address</label>
                        <div className="input-group textarea-group">
                          <MapPin size={18} className="input-icon textarea-icon" />
                          <textarea rows="2" value={childEditData.address}
                            onChange={(e) => setChildEditData({ ...childEditData, address: e.target.value })} />
                        </div>
                      </div>

                      {/* ===== Birth Certificate (view current + replace) ===== */}
                      <div className="form-group">
                        <label className="field-label">Birth Certificate</label>

                        {child.birthCertificate && !newCertificate && (
                          <a
                            href={child.birthCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-current-link"
                          >
                            <Eye size={15} /> View Current Certificate
                          </a>
                        )}

                        <div
                          className="upload-box cert-upload-box"
                          onClick={() => document.getElementById(`certInput-${child.id}`).click()}
                        >
                          <UploadCloud size={22} className="upload-icon" />
                          <p>
                            <span className="upload-link">Click to upload</span> or drag and drop
                          </p>
                          <span className="upload-info">PDF, DOCX, PNG (MAX. 5MB)</span>
                          <input
                            type="file"
                            id={`certInput-${child.id}`}
                            accept=".pdf,.docx,.png,.jpg"
                            onChange={(e) => setNewCertificate(e.target.files[0])}
                            hidden
                          />
                          {newCertificate && (
                            <p className="file-name">
                              <FileText size={14} /> {newCertificate.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="child-edit-actions">
                        <button type="button" className="btn-primary" onClick={() => saveEdit(child.id)}>Save</button>
                        <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="child-item" key={child.id}>
                      <div className="child-item-avatar">{child.name ? child.name[0].toUpperCase() : "C"}</div>
                      <div className="child-item-info">
                        <h4>{child.name}</h4>
                        <p>Age: {calcAge(child.dob)}</p>
                      </div>
                      <div className="child-item-actions">
                        <button className="child-action-btn" onClick={() => startEdit(child)}><Pencil size={16} /></button>
                        <button className="child-action-btn danger" onClick={() => confirmRemoveChild(child)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )
                )}
              </div>
              <button className="btn-secondary add-child-btn" onClick={() => navigate("/add-child")}>
                <UserPlus size={16} /> Add Another Child
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />

      {childToRemove && (
        <div className="modal-overlay" onClick={closeRemoveModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRemoveModal}><X size={18} /></button>
            <div className="modal-icon"><AlertTriangle size={28} color="#ef4444" /></div>
            <h3>Remove {childToRemove.name}?</h3>
            <p>This will permanently remove <strong>{childToRemove.name}</strong>'s profile and records.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeRemoveModal}>Cancel</button>
              <button className="btn-danger-solid" onClick={handleRemoveConfirmed}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </ParentLayout>
  );
};

export default ManageChildren;