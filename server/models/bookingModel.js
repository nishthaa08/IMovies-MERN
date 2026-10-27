const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    // Snapshot so bookings still display if a show/movie is later deleted
    movieName: { type: String, required: true },
    posterUrl: String,
    theatreName: { type: String, required: true },
    showdate: { type: String, required: true },
    showtime: { type: String, required: true },
    seats: {
      balcony: { type: [String], default: [] },
      middle: { type: [String], default: [] },
      lower: { type: [String], default: [] },
    },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
