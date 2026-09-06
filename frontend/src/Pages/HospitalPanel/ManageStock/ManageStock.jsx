import React, { useState, useEffect } from "react";
import "./ManageStock.css";
import hospitalImg from "../../../assets/HDashboard.jpeg";
import "../../../styles/Hospitalshared.css";
import Footer from "../../../Components/Footer/Footer";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import { Plus, PackageCheck, Pencil, Trash2 } from "lucide-react";

const ManageStock = () => {
  const token = localStorage.getItem("token");

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newVaccine, setNewVaccine] = useState({ name: "", quantity: "" });
  const [editItem, setEditItem]     = useState(null);
  const [editValues, setEditValues] = useState({ name: "", quantity: "" });

  // ✅ Fetch real stock from backend on load
  const fetchStock = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/hospital/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to load stock.");
        return;
      }
      // ✅ backend items use MongoDB's _id — map it to id for this UI
      setStocks(result.map((s) => ({ id: s._id, name: s.name, quantity: s.quantity })));
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    // eslint-disable-next-line
  }, []);

  // ✅ Add — real backend call
  const handleAdd = async () => {
    if (!newVaccine.name.trim() || !newVaccine.quantity) return;
    try {
      const response = await fetch("http://localhost:5000/api/hospital/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newVaccine.name.trim(),
          quantity: newVaccine.quantity,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to add vaccine.");
        return;
      }

      setStocks(result.stock.map((s) => ({ id: s._id, name: s.name, quantity: s.quantity })));
      setNewVaccine({ name: "", quantity: "" });
      setError("");
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // ✅ Delete — real backend call
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hospital/stock/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to delete vaccine.");
        return;
      }

      setStocks(result.stock.map((s) => ({ id: s._id, name: s.name, quantity: s.quantity })));
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleEditOpen = (item) => {
    setEditItem(item.id);
    setEditValues({ name: item.name, quantity: item.quantity });
  };

  // ✅ Edit save — real backend call
  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hospital/stock/${editItem}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editValues.name,
          quantity: editValues.quantity,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update vaccine.");
        return;
      }

      setStocks(result.stock.map((s) => ({ id: s._id, name: s.name, quantity: s.quantity })));
      setEditItem(null);
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <HospitalLayout activeModule="stock" topbarTitle="Manage Stock">

      <section className="hospital-page-hero hospital-page-hero-wide">
        <img src={hospitalImg} alt="" className="hospital-page-hero-img" />
        <div className="hospital-page-hero-overlay"></div>
        <div className="hospital-page-hero-content">
          <h1>Vaccine Stock Management</h1>
          <p>Add, update, or remove vaccine inventory for your hospital.</p>
        </div>
      </section>

      <div className="page-content page-content-wide">
        <div className="add-stock-card">
          <h2><Plus size={20} color="#1e5f8e" /> Add Vaccine</h2>
          <div className="stock-form-row">
            <div className="form-group">
              <label className="stock-label">Vaccine Name</label>
              <input className="stock-input" type="text" placeholder="e.g. BCG, Hepatitis B"
                value={newVaccine.name} onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="stock-label">Quantity</label>
              <input className="stock-input" type="number" placeholder="e.g. 50" min="0"
                value={newVaccine.quantity} onChange={(e) => setNewVaccine({ ...newVaccine, quantity: e.target.value })} />
            </div>
            <button className="btn-add" onClick={handleAdd}><Plus size={18} /> Add</button>
          </div>
          {error && <p className="cp-error" style={{ marginTop: 12 }}>{error}</p>}
        </div>

        <div className="stock-table-card">
          <h2><PackageCheck size={20} color="#1e5f8e" /> Current Stock</h2>
          {loading ? (
            <div className="empty-state">Loading stock...</div>
          ) : stocks.length === 0 ? (
            <div className="empty-state">No vaccines added yet.</div>
          ) : (
            <table className="stock-table">
              <thead>
                <tr><th>#</th><th>Vaccine Name</th><th>Quantity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {stocks.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td><span className={`badge-stock ${item.quantity <= 10 ? "badge-low" : "badge-ok"}`}>{item.quantity <= 10 ? "Low Stock" : "Available"}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEditOpen(item)}><Pencil size={13} /> Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />

      {editItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Edit Vaccine</h2>
            <div className="form-group">
              <label className="stock-label">Vaccine Name</label>
              <input className="stock-input" type="text" value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="stock-label">Quantity</label>
              <input className="stock-input" type="number" min="0" value={editValues.quantity} onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-save" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </HospitalLayout>
  );
};

export default ManageStock;
