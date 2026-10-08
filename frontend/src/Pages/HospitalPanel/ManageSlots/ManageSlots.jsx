import React, { useState, useEffect } from "react";
import "./ManageSlots.css";
import hospitalImg from "../../../assets/HDashboard.jpeg";
import "../../../styles/Hospitalshared.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import { Plus, CalendarCheck, Pencil, Trash2, Home, Building2 } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const ManageSlots = () => {
  const token = localStorage.getItem("token");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newSlot, setNewSlot]       = useState({ days: [], timeFrom: "", timeTo: "", totalSlots: "", type: "Hospital" });
  const [editItem, setEditItem]     = useState(null);
  const [editValues, setEditValues] = useState({ day: "", timeFrom: "", timeTo: "", totalSlots: "", type: "Hospital" });
  const [filterType, setFilterType] = useState("All");

  // ✅ Fetch real slots from backend
  // silent = true → no loading spinner / no error flash (used for auto-refresh)
  const fetchSlots = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const response = await fetch("http://localhost:5000/api/hospital/slots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        if (!silent) setError(result.message || "Failed to load slots.");
        return;
      }
      setSlots(result.map((s) => ({ ...s, id: s._id })));
    } catch (err) {
      if (!silent) setError("Server error. Please try again later.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ Load once, then auto-refresh so new parent bookings show up (Booked / Avail / Status)
  useEffect(() => {
    fetchSlots();

    const timer = setInterval(() => fetchSlots(true), 15000); // every 15 sec
    const onFocus = () => fetchSlots(true);                   // when tab is focused again
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line
  }, []);

  const toggleDay = (day, isEdit = false) => {
    if (isEdit) return; // editing is a single slot — day is fixed, not multi-select
    setNewSlot(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  // ✅ Add — real backend call (creates one slot per selected day, in one request)
  const handleAdd = async () => {
    if (!newSlot.days.length || !newSlot.timeFrom || !newSlot.timeTo || !newSlot.totalSlots) return;
    try {
      const response = await fetch("http://localhost:5000/api/hospital/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: newSlot.days,
          timeFrom: newSlot.timeFrom,
          timeTo: newSlot.timeTo,
          totalSlots: newSlot.totalSlots,
          type: newSlot.type,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to add slot.");
        return;
      }

      setSlots(result.slots.map((s) => ({ ...s, id: s._id })));
      setNewSlot({ days: [], timeFrom: "", timeTo: "", totalSlots: "", type: "Hospital" });
      setError("");
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // ✅ Delete — real backend call
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hospital/slots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to delete slot.");
        return;
      }
      setSlots(result.slots.map((s) => ({ ...s, id: s._id })));
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleEditOpen = (item) => {
    setEditItem(item.id);
    setEditValues({ day: item.day, timeFrom: item.timeFrom, timeTo: item.timeTo, totalSlots: item.totalSlots, type: item.type });
  };

  // ✅ Edit save — real backend call
  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hospital/slots/${editItem}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editValues),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update slot.");
        return;
      }
      setSlots(result.slots.map((s) => ({ ...s, id: s._id })));
      setEditItem(null);
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const avail         = (s) => s.totalSlots - s.bookedSlots;
  const homeAvail     = slots.filter(s => s.type === "Home").reduce((a, s) => a + avail(s), 0);
  const hospAvail     = slots.filter(s => s.type === "Hospital").reduce((a, s) => a + avail(s), 0);
  const filteredSlots = filterType === "All" ? slots : slots.filter(s => s.type === filterType);

  return (
    <HospitalLayout activeModule="slots" topbarTitle="Manage Slots">

      <section className="hospital-page-hero">
        <img src={hospitalImg} alt="" className="hospital-page-hero-img" />
        <div className="hospital-page-hero-overlay"></div>
        <div className="hospital-page-hero-content">
          <h1>Appointment Slots</h1>
          <p>Set home and hospital vaccination slots.</p>
        </div>
      </section>

      <div className="page-content page-content-loose">

        {/* Summary */}
        <div className="slots-summary">
          <div className="summary-card summary-home">
            <div className="summary-icon"><Home size={22} color="#7c3aed" /></div>
            <div className="summary-info"><h3>{homeAvail}</h3><p>Home Slots Available</p></div>
          </div>
          <div className="summary-card summary-hospital">
            <div className="summary-icon"><Building2 size={22} color="#1e5f8e" /></div>
            <div className="summary-info"><h3>{hospAvail}</h3><p>Hospital Slots Available</p></div>
          </div>
        </div>

        {/* Add Slot */}
        <div className="add-slot-card">
          <h2><Plus size={18} color="#1e5f8e" /> Add Slot</h2>

          <div className="slot-form-row">
            <div className="slot-field">
              <label className="slot-label">Type</label>
              <select className="slot-input" value={newSlot.type}
                onChange={e => setNewSlot({ ...newSlot, type: e.target.value })}>
                <option value="Hospital">Hospital</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="slot-field">
              <label className="slot-label">From</label>
              <input className="slot-input" type="time" value={newSlot.timeFrom}
                onChange={e => setNewSlot({ ...newSlot, timeFrom: e.target.value })} />
            </div>
            <div className="slot-field">
              <label className="slot-label">To</label>
              <input className="slot-input" type="time" value={newSlot.timeTo}
                onChange={e => setNewSlot({ ...newSlot, timeTo: e.target.value })} />
            </div>
            <div className="slot-field">
              <label className="slot-label">Total</label>
              <input className="slot-input" type="number" placeholder="10" min="1"
                value={newSlot.totalSlots}
                onChange={e => setNewSlot({ ...newSlot, totalSlots: e.target.value })} />
            </div>
          </div>

          <div className="days-label">Select Days</div>
          <div className="days-selector">
            {DAYS.map(day => (
              <button key={day} type="button"
                className={`day-btn ${newSlot.days.includes(day) ? "day-btn-active" : ""}`}
                onClick={() => toggleDay(day)}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {error && <p className="cp-error" style={{ marginTop: 12 }}>{error}</p>}

          <button className="btn-add-slot" onClick={handleAdd}
            style={{ marginTop: 14 }}>
            <Plus size={16} /> Add Slot
          </button>
        </div>

        {/* Filter */}
        <div className="page-filter">
          {["All","Hospital","Home"].map(f => (
            <button key={f}
              className={`filter-btn ${filterType === f ? "filter-active" : ""}`}
              onClick={() => setFilterType(f)}>{f}</button>
          ))}
        </div>

        {/* Table */}
        <div className="slots-table-card">
          <h2><CalendarCheck size={18} color="#1e5f8e" /> Slots List</h2>
          {loading ? (
            <div className="empty-state">Loading slots...</div>
          ) : filteredSlots.length === 0 ? (
            <div className="empty-state">No slots added yet.</div>
          ) : (
            <div className="table-scroll">
              <table className="slots-table">
                <thead>
                  <tr><th>#</th><th>Type</th><th>Day</th><th>From</th><th>To</th><th>Total</th><th>Booked</th><th>Avail</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot, idx) => (
                    <tr key={slot.id}>
                      <td>{idx + 1}</td>
                      <td><span className={`type-badge ${slot.type === "Home" ? "type-home" : "type-hospital"}`}>{slot.type}</span></td>
                      <td>{slot.day}</td>
                      <td>{slot.timeFrom}</td>
                      <td>{slot.timeTo}</td>
                      <td>{slot.totalSlots}</td>
                      <td>{slot.bookedSlots}</td>
                      <td>{avail(slot)}</td>
                      <td><span className={`badge-slot ${avail(slot) === 0 ? "badge-full" : "badge-available"}`}>{avail(slot) === 0 ? "Full" : "Open"}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEditOpen(slot)}><Pencil size={12} /></button>
                          <button className="btn-delete" onClick={() => handleDelete(slot.id)}><Trash2 size={12} /></button>
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

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>Edit Slot</h2>
            <div className="form-group">
              <label className="slot-label">Type</label>
              <select className="slot-input" value={editValues.type}
                onChange={e => setEditValues({ ...editValues, type: e.target.value })}>
                <option value="Hospital">Hospital</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="form-group">
              <label className="slot-label">Day</label>
              <select className="slot-input" value={editValues.day}
                onChange={e => setEditValues({ ...editValues, day: e.target.value })}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="slot-label">From</label>
              <input className="slot-input" type="time" value={editValues.timeFrom}
                onChange={e => setEditValues({ ...editValues, timeFrom: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="slot-label">To</label>
              <input className="slot-input" type="time" value={editValues.timeTo}
                onChange={e => setEditValues({ ...editValues, timeTo: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="slot-label">Total Slots</label>
              <input className="slot-input" type="number" min="1" value={editValues.totalSlots}
                onChange={e => setEditValues({ ...editValues, totalSlots: e.target.value })} />
            </div>
            {error && <p className="cp-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-save" onClick={handleEditSave}>Save</button>
            </div>
          </div>
        </div>
      )}

    </HospitalLayout>
  );
};

export default ManageSlots;