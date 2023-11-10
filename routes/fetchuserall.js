const express = require("express");
const router = express.Router();
const fetchUserController = require("../controllers/fetchUserController");
router.route("/").post(fetchUserController.fetchUserData);

module.exports = router;
