const mongoose = require("mongoose");

// One document per booked seat. The unique index on (show, seat) is what
// guarantees a seat can never be booked twice, even if many requests arrive at once.
const seatReservationSchema = new mongoose.Schema(
  {
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    seat: { type: String, required: true }, // e.g. "B12"
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

seatReservationSchema.index({ show: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model("SeatReservation", seatReservationSchema);
