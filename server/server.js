require("./utils/loadEnv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed } : {}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/movie", require("./routes/movieRoutes"));
app.use("/api/theatre", require("./routes/theatreRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/favorite", require("./routes/favoriteRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });
}

module.exports = app;
