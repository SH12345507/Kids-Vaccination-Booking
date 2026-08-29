const Vaccine = require("../models/Vaccine");

// ===== GET ALL VACCINES (public — any logged-in user, used by vaccine info page) =====
const getAllVaccines = async (req, res) => {
  try {
    const vaccines = await Vaccine.find().sort({ ageInDays: 1 });
    res.status(200).json(vaccines);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== ADD VACCINE (admin only) =====
const addVaccine = async (req, res) => {
  try {
    const { name, ageInDays, ageLabel, description } = req.body;

    if (!name || ageInDays === undefined || !ageLabel) {
      return res.status(400).json({ message: "Name, ageInDays and ageLabel are required" });
    }

    const vaccine = await Vaccine.create({ name, ageInDays, ageLabel, description });
    res.status(201).json({ message: "Vaccine added", vaccine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE VACCINE (admin only) =====
const updateVaccine = async (req, res) => {
  try {
    const { name, ageInDays, ageLabel, description } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (ageInDays !== undefined) updateData.ageInDays = ageInDays;
    if (ageLabel !== undefined) updateData.ageLabel = ageLabel;
    if (description !== undefined) updateData.description = description;

    const vaccine = await Vaccine.findByIdAndUpdate(req.params.vaccineId, updateData, { new: true });
    if (!vaccine) return res.status(404).json({ message: "Vaccine not found" });

    res.status(200).json({ message: "Vaccine updated", vaccine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE VACCINE (admin only) =====
const deleteVaccine = async (req, res) => {
  try {
    const vaccine = await Vaccine.findByIdAndDelete(req.params.vaccineId);
    if (!vaccine) return res.status(404).json({ message: "Vaccine not found" });
    res.status(200).json({ message: "Vaccine removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllVaccines, addVaccine, updateVaccine, deleteVaccine };