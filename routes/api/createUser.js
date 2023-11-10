const express = require("express");
const router = express.Router();
const requestController = require("../../controllers/allController");

router.post("/", requestController.createUser);

module.exports = router;
