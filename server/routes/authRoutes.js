const router = require("express").Router();
const { userAuth } = require("../controllers/authController");
const { userOnly } = require("../middlewares/fetchUser");

router.post("/register", userAuth.register);
router.post("/login", userAuth.login);
router.get("/me", userOnly, userAuth.me);
router.put("/me", userOnly, userAuth.updateMe);

module.exports = router;
