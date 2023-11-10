const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");

router.post("/", registerController.handleNewUser);
router.get("/", registerController.getAllUsers);
router.get("/:email", registerController.getUserByEmail);
router.put("/:email", registerController.updateUser);
router.delete("/:email", registerController.deleteUser);

router.route("/:id/verify/:token/").get(registerController.verifyLink);

module.exports = router;
