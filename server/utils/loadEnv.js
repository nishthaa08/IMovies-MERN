// Loads .env, and makes sure JWT_SECRET is a real secret.
// If it's missing or still the placeholder from .env.example, a random secret is
// generated once and saved in server/.jwt-secret (git-ignored), so logins keep
// working across restarts without anyone editing .env by hand.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const secret = process.env.JWT_SECRET || "";
if (!secret || secret.startsWith("change_this")) {
  const file = path.join(__dirname, "..", ".jwt-secret");
  let generated = "";
  try {
    generated = fs.readFileSync(file, "utf8").trim();
  } catch {
    /* first run */
  }
  if (!generated) {
    generated = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(file, generated);
    console.log("Generated a JWT secret in server/.jwt-secret");
  }
  process.env.JWT_SECRET = generated;
}

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://127.0.0.1:27017/imovies";
}
