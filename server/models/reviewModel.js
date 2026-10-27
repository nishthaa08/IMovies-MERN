const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: { type: String, trim: true, maxlength: [500, "Review cannot exceed 500 characters"] },
  },
  { timestamps: true }
);

// One review per user per movie (posting again updates it)
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
