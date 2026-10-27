const Movie = require("../models/movieModel");
const Show = require("../models/showModel");
const Favorite = require("../models/favoriteModel");
const Review = require("../models/reviewModel");
const SeatReservation = require("../models/seatReservationModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const FIELDS = ["movieName", "description", "genres", "releaseDate", "runtime", "certification", "language", "trailerUrl", "posterUrl"];

// Accepts genres as an array or a comma-separated string
const pickMovie = (body) => {
  const data = {};
  for (const f of FIELDS) if (body[f] !== undefined && body[f] !== "") data[f] = body[f];
  if (typeof data.genres === "string") {
    data.genres = data.genres.split(",").map((g) => g.trim()).filter(Boolean);
  }
  return data;
};

exports.getMovies = asyncHandler(async (req, res) => {
  const { search, genre } = req.query;
  const filter = {};
  if (search) filter.movieName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (genre) filter.genres = { $regex: `^${genre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };

  const movies = await Movie.find(filter).sort({ releaseDate: -1 });
  res.json({ movies });
});

exports.getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new HttpError(404, "Movie not found");

  const ratings = await Review.find({ movie: movie._id }).select("rating").lean();
  const count = ratings.length;
  const average = count ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  res.json({ movie, rating: { average, count } });
});

exports.createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create({ ...pickMovie(req.body), addedBy: req.user.id });
  res.status(201).json({ movie });
});

exports.updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, pickMovie(req.body), {
    new: true,
    runValidators: true,
  });
  if (!movie) throw new HttpError(404, "Movie not found");
  res.json({ movie });
});

// Deleting a movie also removes its shows, favorites and reviews.
// Existing bookings stay (they keep a snapshot of the movie name).
exports.deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw new HttpError(404, "Movie not found");
  const showIds = (await Show.find({ movie: movie._id }).select("_id").lean()).map((s) => s._id);
  await Promise.all([
    Show.deleteMany({ movie: movie._id }),
    SeatReservation.deleteMany({ show: { $in: showIds } }),
    Favorite.deleteMany({ movie: movie._id }),
    Review.deleteMany({ movie: movie._id }),
  ]);
  res.json({ message: "Movie deleted" });
});
