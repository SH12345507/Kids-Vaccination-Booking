import React, { useState, useEffect } from "react";
import "./VaccineInfo.css";
import syringeImg from "../../../assets/syringe.jpeg";
import PageHero from "../../../components/PageHero/PageHero";
import Footer from "../../../components/Footer/Footer";
import { Syringe } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const VaccineInfo = () => {
  const token = localStorage.getItem("token");
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVaccines = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/vaccines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load vaccine info.");
          return;
        }
        // backend field names: ageLabel -> age, description -> desc (matches existing UI)
        setVaccines(
          data.map((v) => ({ name: v.name, age: v.ageLabel, desc: v.description }))
        );
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccines();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="page-bg">
      {/* Hero Section */}
      <PageHero
        image={syringeImg}
        title="Vaccine Info"
        description="Stay informed about each vaccine's purpose, recommended age, and how it helps protect your child against serious diseases."
      />

      {/* Vaccine List - Row Wise */}
      <section className="vaccine-list-wrapper">
        <div className="vaccine-table-wrapper">
          {loading ? (
            <p style={{ textAlign: "center", padding: "30px 0" }}>Loading vaccine info...</p>
          ) : error ? (
            <p style={{ textAlign: "center", padding: "30px 0", color: "#b91c1c" }}>{error}</p>
          ) : vaccines.length === 0 ? (
            <p style={{ textAlign: "center", padding: "30px 0" }}>
              No vaccine info available yet.
            </p>
          ) : (
            <table className="vaccine-table">
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th>Age</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.map((vaccine, idx) => (
                  <tr key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="vaccine-name-cell">
                      <div className="vaccine-icon">
                        <Syringe size={18} color="#1e5f8e" />
                      </div>
                      <span>{vaccine.name}</span>
                    </td>
                    <td>
                      <span className="vaccine-age">{vaccine.age}</span>
                    </td>
                    <td className="vaccine-desc-cell">{vaccine.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VaccineInfo;