const router = require("express").Router();
const c = require("../controllers/showController");
const { adminOnly } = require("../middlewares/fetchUser");

router.get("/admin/mine", adminOnly, c.getMyShows);
router.get("/movie/:movieId", c.getShowsForMovie);
router.get("/:id", c.getShow);
router.post("/", adminOnly, c.createShow);
router.delete("/:id", adminOnly, c.deleteShow);

module.exports = router;
