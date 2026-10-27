const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const FIELDS = [
  "theatreName", "location",
  "balconySeatPrice", "middleSeatPrice", "lowerSeatPrice",
  "balconySeatCount", "middleSeatCount", "lowerSeatCount",
];

exports.getTheatres = asyncHandler(async (req, res) => {
  const theatres = await Theatre.find().sort({ theatreName: 1 });
  res.json({ theatres });
});

exports.createTheatre = asyncHandler(async (req, res) => {
  const data = {};
  for (const f of FIELDS) data[f] = req.body[f];
  if (["balconySeatCount", "middleSeatCount", "lowerSeatCount"].every((f) => !Number(data[f]))) {
    throw new HttpError(400, "A theatre needs at least one seat");
  }
  const theatre = await Theatre.create({ ...data, addedBy: req.user.id });
  res.status(201).json({ theatre });
});

exports.deleteTheatre = asyncHandler(async (req, res) => {
  const upcoming = await Show.exists({ theatre: req.params.id });
  if (upcoming) throw new HttpError(409, "Delete this theatre's shows first");
  const theatre = await Theatre.findByIdAndDelete(req.params.id);
  if (!theatre) throw new HttpError(404, "Theatre not found");
  res.json({ message: "Theatre deleted" });
});
