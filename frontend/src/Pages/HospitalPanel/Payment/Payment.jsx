import React, { useState, useEffect } from "react";
import "./Payment.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout, { useHospital } from "../../../Components/HospitalLayout/HospitalLayout";
import { Banknote, Building2, Home, Save, CheckCircle } from "lucide-react";

// ✅ Outer component — just renders the layout
const Payment = () => {
  return (
    <HospitalLayout activeModule="settings" topbarTitle="Payment">
      <PaymentContent />
    </HospitalLayout>
  );
};

// ✅ Inner component — rendered as {children} inside HospitalLayout, so
// useHospital() correctly finds the Provider here.
const PaymentContent = () => {
  const { hospital, loading, error: ctxError, updateProfile } = useHospital();

  const [fees, setFees] = useState({ hospitalFee: "", homeFee: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (hospital) {
      setFees({
        hospitalFee: hospital.hospitalVisitCharges ?? "",
        homeFee: hospital.homeVisitCharges ?? "",
      });
    }
  }, [hospital]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        hospitalVisitCharges: fees.hospitalFee,
        homeVisitCharges: fees.homeFee,
      });
      showToast("Payment settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-wrapper"><p>Loading...</p></div>;
  }

  const hospitalType = hospital?.type || "Private";

  if (hospitalType === "Government") {
    return (
      <div className="settings-wrapper">
        <div className="form-card payment-gov-box">
          <div className="payment-gov-icon">
            <Building2 size={32} color="#0f6e56" />
          </div>
          <h3>Government Hospital</h3>
          <p>Government hospitals provide <strong>free</strong> vaccination services. No payment setup is required.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="settings-wrapper">
        <div className="form-card">

          {(error || ctxError) && <p className="cp-error">{error || ctxError}</p>}

          <div className="sf-group">
            <label className="sf-label">
              <Building2 size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
              Hospital Visit Fee (Rs.)
            </label>
            <div className="sf-input-wrap">
              <Banknote size={16} className="sf-icon" />
              <input className="sf-input" type="number" min="0"
                placeholder="e.g. 500"
                value={fees.hospitalFee}
                onChange={e => setFees(f => ({ ...f, hospitalFee: e.target.value }))} />
            </div>
            <p className="payment-hint">Charged when parent books a hospital appointment.</p>
          </div>

          <div className="sf-group">
            <label className="sf-label">
              <Home size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
              Home Visit Fee (Rs.)
            </label>
            <div className="sf-input-wrap">
              <Banknote size={16} className="sf-icon" />
              <input className="sf-input" type="number" min="0"
                placeholder="e.g. 800"
                value={fees.homeFee}
                onChange={e => setFees(f => ({ ...f, homeFee: e.target.value }))} />
            </div>
            <p className="payment-hint">Charged when parent books a home visit appointment.</p>
          </div>

          <div className="cp-actions">
            <button className="btn-save-sm" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Fees"}
            </button>
          </div>

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

export default Payment;
