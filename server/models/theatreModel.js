const mongoose = require("mongoose");

const price = (label) => ({
  type: Number,
  required: [true, `${label} seat price is required`],
  min: [0, `${label} seat price cannot be negative`],
});
const count = (label) => ({
  type: Number,
  required: [true, `${label} seat count is required`],
  min: [0, `${label} seat count cannot be negative`],
  max: [500, `${label} seat count cannot exceed 500`],
});

const theatreSchema = new mongoose.Schema(
  {
    theatreName: { type: String, required: [true, "Theatre name is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    balconySeatPrice: price("Balcony"),
    middleSeatPrice: price("Middle"),
    lowerSeatPrice: price("Lower"),
    // Seats are numbered B1..Bn, M1..Mn, L1..Ln from these counts
    balconySeatCount: count("Balcony"),
    middleSeatCount: count("Middle"),
    lowerSeatCount: count("Lower"),
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);
