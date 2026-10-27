const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    adminEmail: { type: String, required: true },
    showdate: {
      type: String, // YYYY-MM-DD
      required: [true, "Show date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Show date must be YYYY-MM-DD"],
    },
    showtime: {
      type: String, // HH:MM (24h)
      required: [true, "Show time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Show time must be HH:MM"],
    },
    // Seat ids already booked in each section
    bookedSeats: {
      balcony: { type: [String], default: [] },
      middle: { type: [String], default: [] },
      lower: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

// No two shows in the same theatre at the same date and time
showSchema.index({ theatre: 1, showdate: 1, showtime: 1 }, { unique: true });

module.exports = mongoose.model("Show", showSchema);
