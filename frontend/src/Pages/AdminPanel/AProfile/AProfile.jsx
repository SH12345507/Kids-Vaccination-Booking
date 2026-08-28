import React, { useState, useEffect } from "react";
import "./AProfile.css";
import Footer from "../../../Components/Footer/Footer";
import AdminLayout, { useAdmin } from "../../../Components/AdminLayout/AdminLayout";
import { User, Mail, Save } from "lucide-react";

// ✅ Outer component — just renders the layout
const AProfile = () => {
  return (
    <AdminLayout activeModule="settings" topbarTitle="Admin Profile">
      <AProfileContent />
    </AdminLayout>
  );
};

// ✅ Inner component — rendered as {children} inside AdminLayout, so
// useAdmin() correctly finds the Provider here.
const AProfileContent = () => {
  const { admin, loading, error: ctxError, updateProfile } = useAdmin();

  const [profile, setProfile] = useState({ username: "", email: "" });
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Sync form with real admin data whenever it loads/changes
  useEffect(() => {
    if (admin) {
      setProfile({ username: admin.name || "", email: admin.email || "" });
    }
  }, [admin]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name: profile.username });
      setSavedMsg("Profile updated successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="aprofile-wrapper"><p>Loading profile...</p></div>;
  }

  return (
    <>
      <div className="aprofile-wrapper">

        {savedMsg && <div className="save-success">{savedMsg}</div>}
        {(error || ctxError) && <div className="save-success save-error">{error || ctxError}</div>}

        <div className="form-card aprofile-card">
          <form onSubmit={handleSave}>

            <div className="aprofile-section-title">
              <User size={18} color="#1e5f8e" /> Account Info
            </div>

            <div className="aprofile-field">
              <label className="aprofile-label">Username</label>
              <div className="aprofile-input-wrap">
                <User size={16} className="aprofile-icon" />
                <input type="text" name="username" placeholder="Enter username"
                  value={profile.username} onChange={handleChange} />
              </div>
            </div>

            <div className="aprofile-field">
              <label className="aprofile-label">Email Address</label>
              <div className="aprofile-input-wrap">
                <Mail size={16} className="aprofile-icon" />
                {/* ✅ Email is read-only — it's used for login, so it isn't editable here */}
                <input type="email" name="email" value={profile.email} disabled />
              </div>
            </div>

            <button type="submit" className="aprofile-save-btn" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AProfile;
