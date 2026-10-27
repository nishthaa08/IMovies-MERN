const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId }).sort({ updatedAt: -1 });
  res.json({ reviews });
});

// Create or update the logged-in user's review for a movie
exports.upsertReview = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { rating, comment } = req.body;
  if (!(await Movie.exists({ _id: movieId }))) throw new HttpError(404, "Movie not found");

  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, "Account not found");

  const review = await Review.findOneAndUpdate(
    { user: user._id, movie: movieId },
    { rating, comment, username: user.username },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await Review.findOneAndDelete({ user: req.user.id, movie: req.params.movieId });
  res.json({ message: "Review removed" });
});
