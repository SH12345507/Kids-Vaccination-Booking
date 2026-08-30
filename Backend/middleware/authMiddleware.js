const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const hospitalOnly = (req, res, next) => {
  if (req.user?.role !== "hospital") {
    return res.status(403).json({ message: "Hospital access only" });
  }
  next();
};

const parentOnly = (req, res, next) => {
  if (req.user?.role !== "parent") {
    return res.status(403).json({ message: "Parent access only" });
  }
  next();
};

module.exports = { protect, adminOnly, hospitalOnly, parentOnly };