const router = require("express").Router();
const c = require("../controllers/movieController");
const { adminOnly } = require("../middlewares/fetchUser");

router.get("/", c.getMovies);
router.get("/:id", c.getMovie);
router.post("/", adminOnly, c.createMovie);
router.put("/:id", adminOnly, c.updateMovie);
router.delete("/:id", adminOnly, c.deleteMovie);

module.exports = router;
