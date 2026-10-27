const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { signToken, publicProfile } = require("../utils/token");

// Builds register/login/me handlers for a model (User or Admin)
const makeAuth = (Model, role) => {
  const register = asyncHandler(async (req, res) => {
    const { username, email, password, adminKey } = req.body;

    if (role === "admin" && process.env.ADMIN_REGISTER_KEY && adminKey !== process.env.ADMIN_REGISTER_KEY) {
      throw new HttpError(403, "Invalid admin registration key");
    }
    if (!username || !email || !password) throw new HttpError(400, "All fields are required");
    if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");

    const exists = await Model.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) throw new HttpError(409, "An account with this email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const doc = await Model.create({ username, email, password: hashed });
    res.status(201).json({ token: signToken(doc, role), user: publicProfile(doc, role) });
  });

  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const doc = await Model.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!doc || !(await bcrypt.compare(password, doc.password))) {
      throw new HttpError(401, "Invalid email or password");
    }
    res.json({ token: signToken(doc, role), user: publicProfile(doc, role) });
  });

  const me = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.user.id);
    if (!doc) throw new HttpError(404, "Account not found");
    res.json({ user: publicProfile(doc, role) });
  });

  const updateMe = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.user.id).select("+password");
    if (!doc) throw new HttpError(404, "Account not found");

    const { username, currentPassword, newPassword } = req.body;
    if (username) doc.username = username;
    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, doc.password))) {
        throw new HttpError(400, "Current password is incorrect");
      }
      if (newPassword.length < 8) throw new HttpError(400, "New password must be at least 8 characters");
      doc.password = await bcrypt.hash(newPassword, 10);
    }
    await doc.save();
    res.json({ user: publicProfile(doc, role) });
  });

  return { register, login, me, updateMe };
};

module.exports = {
  userAuth: makeAuth(User, "user"),
  adminAuth: makeAuth(Admin, "admin"),
};
