const router = require("express").Router();
const c = require("../controllers/reviewController");
const { userOnly } = require("../middlewares/fetchUser");

router.get("/:movieId", c.getReviews);
router.post("/:movieId", userOnly, c.upsertReview);
router.delete("/:movieId", userOnly, c.deleteReview);

module.exports = router;
