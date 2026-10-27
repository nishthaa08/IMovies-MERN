const jwt = require("jsonwebtoken");

// Verifies the JWT from "Authorization: Bearer <token>" and sets req.user = { id, role, email }
const fetchUser = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in to continue" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: `Only ${role}s can do this` });
  }
  next();
};

module.exports = {
  fetchUser,
  userOnly: [fetchUser, requireRole("user")],
  adminOnly: [fetchUser, requireRole("admin")],
};
