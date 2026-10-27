const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: [true, "Movie name is required"],
      trim: true,
      minlength: [2, "Movie name must be at least 2 characters long"],
      maxlength: [200, "Movie name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    genres: {
      type: [String],
      required: [true, "At least one genre is required"],
      validate: {
        validator: (genres) => Array.isArray(genres) && genres.length > 0,
        message: "At least one genre is required",
      },
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
      validate: {
        validator: (date) => date instanceof Date && !isNaN(date),
        message: "Invalid release date",
      },
    },
    runtime: { type: Number, min: [1, "Runtime must be positive"] }, // minutes
    certification: { type: String, trim: true }, // U, UA, A ...
    language: { type: String, trim: true },
    trailerUrl: { type: String, trim: true },
    posterUrl: { type: String, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
