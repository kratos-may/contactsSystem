const router = require("express").Router();
const cContacts = require("../controllers/contacts.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/create",verifyToken, cContacts.saveContacts);
router.get("/",verifyToken, cContacts.getAllContacts);
router.get("/search",verifyToken, cContacts.searchContacts);
router.get("/:id",verifyToken, cContacts.getContactsById);
router.delete("/delete/:id",verifyToken,cContacts.deleteContacts);
router.put("/update/:id",verifyToken,cContacts.updateContacts);

module.exports = router;

