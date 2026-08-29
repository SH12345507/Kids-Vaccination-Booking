// ===== ONE-TIME SEED SCRIPT =====
// Purpose: inserts the standard vaccine list into the Vaccine collection.
// Run manually from your backend project root:   node seed/seedVaccines.js
// (Place this file inside a "seed" folder in your backend, next to server.js)

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Vaccine = require("../models/Vaccine"); // adjust path if this file isn't inside /seed

dotenv.config();

const vaccines = [
  {
    name: "BCG",
    ageInDays: 0,
    ageLabel: "At Birth",
    description: "Protects against tuberculosis (TB).",
  },
  {
    name: "Hepatitis B (1st dose)",
    ageInDays: 0,
    ageLabel: "At Birth",
    description: "Prevents hepatitis B virus infection from early life.",
  },
  {
    name: "Pentavalent + OPV (1st)",
    ageInDays: 42,
    ageLabel: "6 Weeks",
    description: "Protects against polio, diphtheria, pertussis, tetanus, Hib & hepatitis B.",
  },
  {
    name: "PCV (1st dose)",
    ageInDays: 42,
    ageLabel: "6 Weeks",
    description: "Protects against pneumococcal infections like pneumonia.",
  },
  {
    name: "Rotavirus (1st dose)",
    ageInDays: 42,
    ageLabel: "6 Weeks",
    description: "Prevents severe diarrhea caused by rotavirus.",
  },
  {
    name: "Pentavalent + OPV (2nd)",
    ageInDays: 70,
    ageLabel: "10 Weeks",
    description: "Second dose for continued protection against major diseases.",
  },
  {
    name: "Pentavalent + OPV + IPV (3rd)",
    ageInDays: 98,
    ageLabel: "14 Weeks",
    description: "Final primary dose, includes inactivated polio vaccine.",
  },
  {
    name: "Measles (1st) + Vitamin A",
    ageInDays: 270,
    ageLabel: "9 Months",
    description: "Protects against measles and supports immunity & eyesight.",
  },
  {
    name: "MMR + Varicella",
    ageInDays: 450,
    ageLabel: "15 Months",
    description: "Protects against measles, mumps, rubella & chickenpox.",
  },
  {
    name: "DPT & OPV Booster",
    ageInDays: 540,
    ageLabel: "18 Months",
    description: "Booster dose to maintain immunity from earlier vaccines.",
  },
  {
    name: "DPT Booster (2nd) + MMR (2nd)",
    ageInDays: 1825,
    ageLabel: "4-6 Years",
    description: "Final booster dose before starting school.",
  },
];

const seedVaccines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database...");

    for (const v of vaccines) {
      // ✅ skip if a vaccine with this name already exists (safe to re-run)
      const exists = await Vaccine.findOne({ name: v.name });
      if (exists) {
        console.log(`Skipped (already exists): ${v.name}`);
        continue;
      }
      await Vaccine.create(v);
      console.log(`Added: ${v.name}`);
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedVaccines();