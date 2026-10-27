const mongoose = require("mongoose");

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    console.error("MONGO_URI is missing. Copy .env.example to .env and set it.");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    // Make sure unique indexes exist before any request arrives
    require("../models/seatReservationModel");
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err.message));
  mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));
};

module.exports = connectDB;
