const router = require("express").Router();
const c = require("../controllers/favoriteController");
const { userOnly } = require("../middlewares/fetchUser");

router.get("/", userOnly, c.getFavorites);
router.post("/:movieId", userOnly, c.toggleFavorite);

module.exports = router;
