const jwt = require("jsonwebtoken");

const signToken = (doc, role) =>
  jwt.sign({ id: doc._id.toString(), role, email: doc.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const publicProfile = (doc, role) => ({
  id: doc._id,
  username: doc.username,
  email: doc.email,
  role,
});

module.exports = { signToken, publicProfile };
