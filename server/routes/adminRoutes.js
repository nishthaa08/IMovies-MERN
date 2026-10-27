const router = require("express").Router();
const { adminAuth } = require("../controllers/authController");
const { getAllBookings } = require("../controllers/bookingController");
const { adminOnly } = require("../middlewares/fetchUser");

router.post("/register", adminAuth.register);
router.post("/login", adminAuth.login);
router.get("/me", adminOnly, adminAuth.me);
router.get("/bookings", adminOnly, getAllBookings);

module.exports = router;
