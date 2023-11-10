const express = require("express");
const router = express.Router();
const requestController = require("../../controllers/unitController");

router.post("/", requestController.createNewUnit);

module.exports = router;
