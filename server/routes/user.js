const router = require("express").Router();
const cUser = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/register", cUser.saveUser);
router.put("/update/:id",verifyToken, cUser.update);

module.exports = router;

