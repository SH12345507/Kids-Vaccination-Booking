import React, { useState, useEffect } from "react";
import "../../../styles/ParentShared.css";
import "./Profile.css";
import Footer from "../../../Components/Footer/Footer";
import ParentLayout, { useParent } from "../../../Components/ParentLayout/ParentLayout";
import { User, Mail, Phone, CheckCircle2 } from "lucide-react";

// ✅ Outer component — just renders the layout
const Profile = () => {
  return (
    <ParentLayout topbarTitle="Profile">
      <ProfileContent />
    </ParentLayout>
  );
};

// ✅ Inner component — rendered inside ParentLayout, so useParent() correctly
// finds the Provider here.
const ProfileContent = () => {
  const { parent, loading, error: ctxError, updateProfile } = useParent();

  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", whatsapp: "" });
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Backend stores a single "name" field — split it into first/last for this UI
  useEffect(() => {
    if (parent) {
      const parts = (parent.name || "").split(" ");
      setProfile({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: parent.email || "",
        whatsapp: parent.phone || "",
      });
    }
  }, [parent]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // ✅ Recombine first + last name into the single "name" field the backend expects
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      await updateProfile({ name: fullName, phone: profile.whatsapp });
      setSavedMsg("Profile updated successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-subpage-wrapper"><p>Loading profile...</p></div>;
  }

  return (
    <>
      <div className="settings-subpage-wrapper">
        <div className="form-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar-lg">
              {profile.firstName ? profile.firstName[0].toUpperCase() : "P"}
            </div>
            <div>
              <h4>{profile.firstName || "Parent"} {profile.lastName}</h4>
              <p>{profile.email || "No email added yet"}</p>
            </div>
          </div>

          {(error || ctxError) && <p className="error-text">{error || ctxError}</p>}

          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="field-label">First Name</label>
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={profile.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="field-label">Last Name</label>
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={profile.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Email Address</label>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                {/* ✅ Email is read-only — it's used for login */}
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">WhatsApp Number</label>
              <div className="input-group">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="Enter your WhatsApp number"
                  value={profile.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="settings-save-row">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {savedMsg && (
              <p className="save-success">
                <CheckCircle2 size={16} /> {savedMsg}
              </p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
