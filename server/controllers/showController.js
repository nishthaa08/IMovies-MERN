const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const SeatReservation = require("../models/seatReservationModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

// Today's date as YYYY-MM-DD in the server's local timezone
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const byDateTime = (a, b) => (a.showdate + a.showtime).localeCompare(b.showdate + b.showtime);

// Upcoming shows for one movie, grouped data comes with theatre info
exports.getShowsForMovie = asyncHandler(async (req, res) => {
  const shows = await Show.find({ movie: req.params.movieId, showdate: { $gte: today() } })
    .populate("theatre")
    .select("-bookedSeats");
  res.json({ shows: shows.sort(byDateTime) });
});

// One show with its theatre and booked seats (used by the seat picker)
exports.getShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id).populate("theatre").populate("movie");
  if (!show) throw new HttpError(404, "Show not found");
  res.json({ show });
});

// Shows created by the logged-in admin
exports.getMyShows = asyncHandler(async (req, res) => {
  const shows = await Show.find({ admin: req.user.id })
    .populate("movie", "movieName posterUrl")
    .populate("theatre", "theatreName location");
  res.json({ shows: shows.sort(byDateTime) });
});

exports.createShow = asyncHandler(async (req, res) => {
  const { movieId, theatreId, showdate, showtime } = req.body;
  if (!movieId || !theatreId || !showdate || !showtime) {
    throw new HttpError(400, "Movie, theatre, date and time are required");
  }
  if (showdate < today()) throw new HttpError(400, "Show date cannot be in the past");

  const [movie, theatre] = await Promise.all([Movie.findById(movieId), Theatre.findById(theatreId)]);
  if (!movie) throw new HttpError(404, "Movie not found");
  if (!theatre) throw new HttpError(404, "Theatre not found");

  const show = await Show.create({
    movie: movie._id,
    theatre: theatre._id,
    admin: req.user.id,
    adminEmail: req.user.email,
    showdate,
    showtime,
  }).catch((err) => {
    if (err.code === 11000) throw new HttpError(409, "This theatre already has a show at that date and time");
    throw err;
  });
  res.status(201).json({ show });
});

exports.deleteShow = asyncHandler(async (req, res) => {
  const show = await Show.findOneAndDelete({ _id: req.params.id, admin: req.user.id });
  if (!show) throw new HttpError(404, "Show not found");
  await SeatReservation.deleteMany({ show: show._id });
  res.json({ message: "Show deleted" });
});
