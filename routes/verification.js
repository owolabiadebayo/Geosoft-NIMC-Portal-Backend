const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");

router.route("/").post(verificationController.newVerification);

module.exports = router;
