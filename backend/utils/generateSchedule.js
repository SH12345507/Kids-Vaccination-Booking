const Vaccine = require("../models/Vaccine");
const Hospital = require("../models/Hospital");

// Builds the vaccine list (in order) from the Vaccine collection for a new child,
// and marks each vaccine's stockStatus by checking the selected hospital's own stock.
// ✅ dueDate is intentionally left unset — the hospital enters it manually for one
// vaccine at a time, right before/after administering it (see ManageSchedule.jsx).
// ✅ startVaccineId (optional) — if the child has already received some earlier
// vaccines elsewhere, the schedule can start from a later point instead of BCG/birth.
// ✅ singleOnly (optional) — when true, only startVaccineId itself is included
// (used when autoSchedule is off but the parent still picked one vaccine to track).
async function generateSchedule(dateOfBirth, hospitalId, startVaccineId, singleOnly = false) {
  let vaccines = await Vaccine.find().sort({ ageInDays: 1 });

  if (startVaccineId) {
    const startVaccine = vaccines.find((v) => v._id.toString() === startVaccineId);
    if (startVaccine) {
      vaccines = singleOnly
        ? [startVaccine]
        : vaccines.filter((v) => v.ageInDays >= startVaccine.ageInDays);
    }
  } else if (singleOnly) {
    // no vaccine selected and only-one-was-requested — nothing to schedule
    vaccines = [];
  }

  // ✅ fetch the selected hospital's stock once (empty array if hospital not found/not given)
  let hospitalStock = [];
  if (hospitalId) {
    const hospital = await Hospital.findById(hospitalId).select("stock");
    hospitalStock = hospital?.stock || [];
  }

  return vaccines.map((v) => {
    // ✅ match vaccine name against hospital stock (case-insensitive), quantity must be > 0
    const stockItem = hospitalStock.find(
      (s) => s.name.toLowerCase() === v.name.toLowerCase()
    );
    const stockStatus = stockItem && stockItem.quantity > 0 ? "Available" : "Out of Stock";

    return {
      vaccine: v._id,
      dueDate: null,
      status: "Pending",
      stockStatus,
    };
  });
}

module.exports = generateSchedule;