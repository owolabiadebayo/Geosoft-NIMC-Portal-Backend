const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/paymentController");

router
  .route("/")
  .post(paymentController.paymentController)
  .get(paymentController.fetchPayData);

router.route("/:id").get(paymentController.fetchPayEmail);

module.exports = router;
