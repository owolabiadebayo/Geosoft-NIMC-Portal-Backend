const express = require("express");
const router = express.Router();
const allController = require("../../controllers/allController");

router.route("/").put(allController.updateEnable);

module.exports = router;
