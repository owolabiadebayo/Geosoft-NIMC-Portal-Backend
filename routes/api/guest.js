const express = require("express");
const router = express.Router();
const verificationController = require("../../controllers/guestController");

router.route("/").post(verificationController.newVerification);

module.exports = router;
