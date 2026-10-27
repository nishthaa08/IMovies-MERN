const router = require("express").Router();
const c = require("../controllers/bookingController");
const { userOnly } = require("../middlewares/fetchUser");

router.post("/", userOnly, c.createBooking);
router.get("/my", userOnly, c.getMyBookings);

module.exports = router;
