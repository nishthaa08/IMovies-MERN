const Favorite = require("../models/favoriteModel");
const Movie = require("../models/movieModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

exports.getFavorites = asyncHandler(async (req, res) => {
  const favs = await Favorite.find({ user: req.user.id }).populate("movie").sort({ createdAt: -1 });
  res.json({ movies: favs.map((f) => f.movie).filter(Boolean) });
});

// Adds the movie if it's not a favorite yet, removes it if it is
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  if (!(await Movie.exists({ _id: movieId }))) throw new HttpError(404, "Movie not found");

  const removed = await Favorite.findOneAndDelete({ user: req.user.id, movie: movieId });
  if (removed) return res.json({ favorite: false });

  await Favorite.create({ user: req.user.id, movie: movieId });
  res.status(201).json({ favorite: true });
});
