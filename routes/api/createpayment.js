const express = require("express");
const router = express.Router();
const createpayController = require("../../controllers/createpayController");

router.post("/", createpayController.createPayment);

module.exports = router;
