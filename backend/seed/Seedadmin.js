// One-time (or repeatable) script to create an Admin account.
// Safe to run more than once — it checks for an existing admin with the
// same email before creating a new one, so it won't create duplicates.
//
// Run from the Backend folder with:
//   node seed/seedAdmin.js
//
// Change the ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME values below before
// running, or set them as environment variables in .env instead.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@kvb.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected — seeding admin...");

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`An admin with email "${ADMIN_EMAIL}" already exists — skipping creation.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });

    console.log("✅ Admin created successfully:");
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}  (change this after logging in!)`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();