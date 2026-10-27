/**
 * Fills the database with demo data so the app isn't empty on first run.
 * Run with:  npm run seed
 * WARNING: clears existing movies, theatres, shows, bookings, favorites and reviews.
 */
require("./loadEnv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./db");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const Favorite = require("../models/favoriteModel");
const Review = require("../models/reviewModel");
const SeatReservation = require("../models/seatReservationModel");

const dateAfter = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const upsertAccount = async (Model, { username, email, password }) => {
  const hashed = await bcrypt.hash(password, 10);
  await Model.updateOne({ email }, { username, email, password: hashed }, { upsert: true });
  return Model.findOne({ email });
};

(async () => {
  await connectDB();

  await Promise.all([
    Movie.deleteMany({}), Theatre.deleteMany({}), Show.deleteMany({}),
    Booking.deleteMany({}), Favorite.deleteMany({}), Review.deleteMany({}),
    SeatReservation.deleteMany({}),
  ]);

  const admin = await upsertAccount(Admin, { username: "admin", email: "admin@imovies.com", password: "admin12345" });
  await upsertAccount(User, { username: "demo", email: "user@imovies.com", password: "user12345" });

  const movies = await Movie.insertMany([
    {
      movieName: "Midnight Express Line",
      description: "A night-shift train driver uncovers a smuggling ring running through the city's last metro line.",
      genres: ["Action", "Thriller"],
      releaseDate: new Date(dateAfter(-20)),
      runtime: 142, certification: "UA", language: "Hindi", addedBy: admin._id,
    },
    {
      movieName: "Monsoon Letters",
      description: "Two pen pals in Indore and Kochi exchange letters for a decade before they finally meet.",
      genres: ["Romance", "Drama"],
      releaseDate: new Date(dateAfter(-8)),
      runtime: 128, certification: "U", language: "Hindi", addedBy: admin._id,
    },
    {
      movieName: "The Last Over",
      description: "A small-town cricket team gets one shot at the state finals with a retired coach and a borrowed pitch.",
      genres: ["Sports", "Drama"],
      releaseDate: new Date(dateAfter(-3)),
      runtime: 151, certification: "U", language: "Hindi", addedBy: admin._id,
    },
    {
      movieName: "Orbit 9",
      description: "The crew of a failing space station has 72 hours to decide who goes home in the only escape pod.",
      genres: ["Sci-Fi", "Adventure"],
      releaseDate: new Date(dateAfter(5)),
      runtime: 135, certification: "UA", language: "English", addedBy: admin._id,
    },
  ]);

  const theatres = await Theatre.insertMany([
    {
      theatreName: "Galaxy Cinemas", location: "Vijay Nagar, Indore",
      balconySeatPrice: 350, middleSeatPrice: 250, lowerSeatPrice: 150,
      balconySeatCount: 20, middleSeatCount: 40, lowerSeatCount: 30, addedBy: admin._id,
    },
    {
      theatreName: "Regal Screens", location: "Palasia, Indore",
      balconySeatPrice: 400, middleSeatPrice: 280, lowerSeatPrice: 180,
      balconySeatCount: 16, middleSeatCount: 32, lowerSeatCount: 24, addedBy: admin._id,
    },
  ]);

  const showDocs = [];
  for (const movie of movies.slice(0, 3)) {
    for (const [i, theatre] of theatres.entries()) {
      for (const day of [1, 2]) {
        for (const time of i === 0 ? ["13:30", "18:45"] : ["15:00", "21:15"]) {
          showDocs.push({
            movie: movie._id, theatre: theatre._id, admin: admin._id, adminEmail: admin.email,
            showdate: dateAfter(day), showtime: time,
          });
        }
      }
    }
  }
  // Theatre + date + time must be unique, so offset each movie by a few minutes
  showDocs.forEach((s, idx) => {
    const movieIdx = Math.floor(idx / 8);
    const [h, m] = s.showtime.split(":").map(Number);
    const total = h * 60 + m + movieIdx * 5;
    s.showtime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  });
  await Show.insertMany(showDocs);

  console.log(`Seeded ${movies.length} movies, ${theatres.length} theatres, ${showDocs.length} shows`);
  console.log("Admin login:  admin@imovies.com / admin12345");
  console.log("User login:   user@imovies.com  / user12345");
  await mongoose.disconnect();
})();
