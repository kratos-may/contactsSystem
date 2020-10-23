const router = require("express").Router();
const cUser = require("../controllers/user.controller");
const { verifyToken, verifyRoleAdmin } = require("../middleware/auth");

router.post("/register", cUser.saveUser);
router.get("/",verifyToken, cUser.getAllUser);
router.get("/search",[verifyToken, verifyRoleAdmin],cUser.searchUser);
router.get("/:id",verifyToken, cUser.getUserById);
router.put("/update",verifyToken, cUser.update);
router.delete("/:id", [verifyToken, verifyRoleAdmin], cUser.deleteUser);

module.exports = router;

