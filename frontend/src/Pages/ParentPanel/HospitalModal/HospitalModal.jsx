import React, { useState } from "react";
import { X, MapPin, Phone, CreditCard, Star } from "lucide-react";
import "./HospitalModal.css";

const HospitalModal = ({ hospital, onClose, onRate }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitRating = () => {
    if (rating === 0) return;
    onRate(hospital._id, rating);
    setRating(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2>{hospital.name}</h2>
        <span className="hospital-type-badge">{hospital.type}</span>

        <div className="modal-detail-row">
          <MapPin size={16} /> <span>{hospital.address}</span>
        </div>
        <div className="modal-detail-row">
          <Phone size={16} /> <span>{hospital.phone}</span>
        </div>

        {hospital.type === "Government" ? (
          <div className="modal-detail-row">
            <CreditCard size={16} /> <span>Free (Government Hospital)</span>
          </div>
        ) : (
          <>
            <div className="modal-detail-row">
              <CreditCard size={16} />{" "}
              <span>Hospital Visit: Rs. {hospital.hospitalVisitCharges}</span>
            </div>
            <div className="modal-detail-row">
              <CreditCard size={16} />{" "}
              <span>Home Visit: Rs. {hospital.homeVisitCharges}</span>
            </div>
          </>
        )}

        <div className="modal-rating-summary">
          <Star size={18} fill="#f5a623" stroke="#f5a623" />
          <span>{hospital.averageRating || 0} / 5</span>
          <span className="rating-count">
            ({hospital.ratings?.length || 0} reviews)
          </span>
        </div>

        <div className="modal-rate-section">
          <p className="field-label">Rate this hospital</p>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                fill={star <= (hoverRating || rating) ? "#f5a623" : "none"}
                stroke="#f5a623"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={handleSubmitRating}>
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalModal;