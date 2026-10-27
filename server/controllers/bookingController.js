const mongoose = require("mongoose");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const SeatReservation = require("../models/seatReservationModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { SECTIONS, isValidSeat } = require("../utils/seats");

const MAX_SEATS_PER_BOOKING = 10;

/**
 * POST /api/bookings
 * body: { showId, seats: { balcony: ["B1"], middle: [], lower: ["L4","L5"] } }
 *
 * Each seat is reserved as a document with a unique (show, seat) index, so two
 * people clicking "Book" on the same seat at the same moment can never both get it.
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const { showId, seats = {} } = req.body;
  if (!showId) throw new HttpError(400, "showId is required");

  const show = await Show.findById(showId).populate("theatre").populate("movie");
  if (!show) throw new HttpError(404, "Show not found");
  if (!show.movie || !show.theatre) throw new HttpError(410, "This show is no longer available");

  const now = new Date();
  const showStart = new Date(`${show.showdate}T${show.showtime}:00`);
  if (showStart < now) throw new HttpError(400, "This show has already started");

  // Clean and validate requested seats
  const requested = {};
  let total = 0;
  let count = 0;
  for (const section of Object.keys(SECTIONS)) {
    const list = [...new Set(Array.isArray(seats[section]) ? seats[section] : [])];
    for (const seatId of list) {
      if (!isValidSeat(show.theatre, section, seatId)) throw new HttpError(400, `Seat ${seatId} does not exist`);
    }
    requested[section] = list;
    count += list.length;
    total += list.length * show.theatre[SECTIONS[section].priceField];
  }
  if (count === 0) throw new HttpError(400, "Select at least one seat");
  if (count > MAX_SEATS_PER_BOOKING) throw new HttpError(400, `You can book up to ${MAX_SEATS_PER_BOOKING} seats at once`);

  // Reserve each seat. The unique (show, seat) index makes a second insert of the
  // same seat fail, so only one request can ever win a seat.
  const bookingId = new mongoose.Types.ObjectId();
  const allSeats = Object.values(requested).flat();
  try {
    await SeatReservation.insertMany(
      allSeats.map((seat) => ({ show: show._id, seat, booking: bookingId })),
      { ordered: true }
    );
  } catch (err) {
    await SeatReservation.deleteMany({ booking: bookingId });
    if (err.code === 11000 || err.writeErrors?.some((e) => e.code === 11000)) {
      throw new HttpError(409, "Some of those seats were just booked by someone else. Please pick again.");
    }
    throw err;
  }

  // Mirror the booked seats on the show so the seat map can display them
  const addSeats = { $addToSet: {} };
  for (const [section, list] of Object.entries(requested)) {
    if (list.length) addSeats.$addToSet[`bookedSeats.${section}`] = { $each: list };
  }

  try {
    await Show.updateOne({ _id: show._id }, addSeats);
    const booking = await Booking.create({
      _id: bookingId,
      user: req.user.id,
      userEmail: req.user.email,
      show: show._id,
      movieName: show.movie.movieName,
      posterUrl: show.movie.posterUrl,
      theatreName: show.theatre.theatreName,
      showdate: show.showdate,
      showtime: show.showtime,
      seats: requested,
      totalPrice: total,
    });
    res.status(201).json({ booking });
  } catch (err) {
    // Release the seats if saving the booking failed
    const release = { $pullAll: {} };
    for (const [section, list] of Object.entries(requested)) {
      if (list.length) release.$pullAll[`bookedSeats.${section}`] = list;
    }
    await Promise.all([
      Show.updateOne({ _id: show._id }, release),
      SeatReservation.deleteMany({ booking: bookingId }),
    ]);
    throw err;
  }
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ bookings });
});

// Admin: every booking
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json({ bookings });
});
