import React, { useState, useEffect } from "react";
import "./ViewRating.css";
import "../../../styles/Hospitalshared.css";
import HospitalLayout from "../../../Components/HospitalLayout/HospitalLayout";
import Footer from "../../../Components/Footer/Footer";
import { Star } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const StarDisplay = ({ rating }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={16}
        fill={s <= rating ? "#f59e0b" : "none"}
        color={s <= rating ? "#f59e0b" : "#d1d5db"}
      />
    ))}
  </div>
);

const ViewRating = () => {
  const token = localStorage.getItem("token");
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRatings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/hospital/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load ratings.");
        return;
      }
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating || 0);
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line
  }, []);

  // ✅ How many reviews gave each star count (5,4,3,2,1) — for the bar chart
  const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...starBreakdown.map((b) => b.count));

  return (
    <HospitalLayout activeModule="rating" topbarTitle="View Rating">
      <div className="page-content">
        {loading ? (
          <p className="hint-text">Loading...</p>
        ) : error ? (
          <p className="hint-text" style={{ color: "#b91c1c" }}>{error}</p>
        ) : (
          <>
            {/* Summary */}
            <div className="rating-summary">
              <div className="avg-score">
                <h2>{averageRating.toFixed(1)}</h2>
                <StarDisplay rating={Math.round(averageRating)} />
                <p>{ratings.length} review{ratings.length !== 1 ? "s" : ""}</p>
              </div>

              <div className="rating-bars">
                {starBreakdown.map(({ star, count }) => (
                  <div className="rating-bar-row" key={star}>
                    <span className="bar-label">{star} <Star size={11} fill="#f59e0b" color="#f59e0b" /></span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* List of reviews */}
            {ratings.length === 0 ? (
              <div className="empty-state">No ratings yet.</div>
            ) : (
              ratings.map((r) => (
                <div className="rating-card" key={r._id}>
                  <div className="rating-row">
                    <div className="user-initial">
                      {r.parent?.name ? r.parent.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="rating-info">
                      <h3>{r.parent?.name || "Parent"}</h3>
                      {r.comment && <p>{r.comment}</p>}
                    </div>
                    <div className="rating-right">
                      <StarDisplay rating={r.rating} />
                      <span className="rating-date">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      <Footer />
    </HospitalLayout>
  );
};

export default ViewRating;