
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Configure Cloudinary using credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Files now upload STRAIGHT to Cloudinary (the cloud) instead of a local
// folder — so every machine (yours, your friend's, or a deployed server)
// sees the SAME file, because it lives online, not on one person's laptop.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kvb/certificates",
    allowed_formats: ["pdf", "png", "jpg", "jpeg"],
    resource_type: "auto", // needed so PDFs (not just images) upload correctly
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
