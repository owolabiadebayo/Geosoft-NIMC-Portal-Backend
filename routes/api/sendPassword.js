const express = require("express");
const router = express.Router();
const changePass = require("../../controllers/changePassController");

router.route("/").post(changePass.sendPassword);

module.exports = router;
