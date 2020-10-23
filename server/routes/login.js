const router = require("express").Router();
const cUser = require("../controllers/user.controller");

router.post("/", cUser.login);

module.exports = router;
