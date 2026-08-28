import React, { useState, useRef, useEffect } from "react";
import "./HProfile.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout, { useHospital } from "../../../Components/HospitalLayout/HospitalLayout";
import { Building2, Mail, Phone, MapPin, UploadCloud, Save, Pencil, X, CheckCircle } from "lucide-react";

const mapFromBackend = (h) => ({
  hospitalName: h?.name || "",
  email: h?.email || "",
  phone: h?.phone || "",
  address: h?.address || "",
  hospitalType: h?.type || "",
});

// ✅ Outer component — just renders the layout
const HProfile = () => {
  return (
    <HospitalLayout activeModule="settings" topbarTitle="Profile">
      <HProfileContent />
    </HospitalLayout>
  );
};

// ✅ Inner component — rendered as {children} inside HospitalLayout, so
// useHospital() correctly finds the Provider here.
const HProfileContent = () => {
  const fileRef = useRef();
  const { hospital, loading, error: ctxError, updateProfile } = useHospital();

  const [draft, setDraft] = useState(mapFromBackend(hospital));
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setDraft(mapFromBackend(hospital));
  }, [hospital]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const field = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProfile(
        {
          name: draft.hospitalName,
          phone: draft.phone,
          address: draft.address,
          type: draft.hospitalType,
        },
        file
      );
      setFile(null);
      setEditMode(false);
      showToast("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(mapFromBackend(hospital));
    setFile(null);
    setEditMode(false);
    setError("");
  };

  if (loading) {
    return <div className="hprofile-wrapper"><p>Loading profile...</p></div>;
  }

  const data = mapFromBackend(hospital);

  return (
    <>
      <div className="hprofile-wrapper">
        <div className="hprofile-card form-card">

          <div className="hprofile-header">
            <div className="hprofile-avatar">
              <Building2 size={32} color="#1e5f8e" />
            </div>
            <div>
              <h3>{data.hospitalName}</h3>
              <span className={`type-pill ${data.hospitalType === "Government" ? "pill-gov" : "pill-priv"}`}>
                {data.hospitalType}
              </span>
            </div>
            {!editMode && (
              <button className="btn-ghost-edit ms-auto"
                onClick={() => { setDraft(data); setEditMode(true); }}>
                <Pencil size={15} /> Edit
              </button>
            )}
          </div>

          <div className="hprofile-divider" />

          {(error || ctxError) && <p className="cp-error">{error || ctxError}</p>}

          {editMode ? (
            <div className="hprofile-form">

              <div className="sf-group">
                <label className="sf-label">Hospital Name</label>
                <div className="sf-input-wrap">
                  <Building2 size={16} className="sf-icon" />
                  <input className="sf-input" value={draft.hospitalName}
                    onChange={e => field("hospitalName", e.target.value)} />
                </div>
              </div>

              <div className="sf-group">
                <label className="sf-label">Email Address</label>
                <div className="sf-input-wrap">
                  <Mail size={16} className="sf-icon" />
                  <input className="sf-input" type="email" value={draft.email} disabled />
                </div>
              </div>

              <div className="sf-group">
                <label className="sf-label">Phone Number</label>
                <div className="sf-input-wrap">
                  <Phone size={16} className="sf-icon" />
                  <input className="sf-input" type="tel" value={draft.phone}
                    onChange={e => field("phone", e.target.value)} />
                </div>
              </div>

              <div className="sf-group">
                <label className="sf-label">Full Address</label>
                <div className="sf-input-wrap sf-textarea-wrap">
                  <MapPin size={16} className="sf-icon" style={{ marginTop: 3 }} />
                  <textarea className="sf-input sf-textarea" rows={3} value={draft.address}
                    onChange={e => field("address", e.target.value)} />
                </div>
              </div>

              <div className="sf-group">
                <label className="sf-label">Hospital Type</label>
                <div className="type-toggle">
                  {["Government", "Private"].map(t => (
                    <button key={t} type="button"
                      className={`type-btn ${draft.hospitalType === t ? "type-btn-active" : ""}`}
                      onClick={() => field("hospitalType", t)}>
                      <Building2 size={15} /> {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sf-group">
                <label className="sf-label">Verification Certificate</label>
                <div className="upload-box-sm"
                  onClick={() => fileRef.current.click()}
                  onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                  onDragOver={e => e.preventDefault()}>
                  <UploadCloud size={22} color="#94a3b8" />
                  <p>{file ? file.name : "Click or drag to replace certificate"}</p>
                  <span>PDF, PNG, JPG · max 5MB</span>
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    hidden onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>

              <div className="hprofile-actions">
                <button className="btn-cancel-sm" onClick={handleCancel} disabled={saving}>
                  <X size={15} /> Cancel
                </button>
                <button className="btn-save-sm" onClick={handleSave} disabled={saving}>
                  <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          ) : (
            <div className="hprofile-view">
              <div className="info-row"><Mail size={15} /><span>{data.email}</span></div>
              <div className="info-row"><Phone size={15} /><span>{data.phone}</span></div>
              <div className="info-row"><MapPin size={15} /><span>{data.address}</span></div>
              <div className="info-row"><Building2 size={15} /><span>{data.hospitalType} Hospital</span></div>
            </div>
          )}

        </div>
      </div>

      <Footer />

      {toast && (
        <div className="settings-toast">
          <CheckCircle size={16} color="#0f6e56" /> {toast}
        </div>
      )}
    </>
  );
};

export default HProfile;
