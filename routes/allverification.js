const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");

router.route("/").post(verificationController.getAllVerification);

router
  .route("/:email")
  .get(verificationController.getTotalVerificationCountByEmail);

module.exports = router;
