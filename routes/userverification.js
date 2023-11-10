const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
router.route("/").post(apiController.getVerification);

module.exports = router;
