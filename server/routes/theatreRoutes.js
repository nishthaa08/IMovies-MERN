const router = require("express").Router();
const c = require("../controllers/theatreController");
const { adminOnly } = require("../middlewares/fetchUser");

router.get("/", c.getTheatres);
router.post("/", adminOnly, c.createTheatre);
router.delete("/:id", adminOnly, c.deleteTheatre);

module.exports = router;
