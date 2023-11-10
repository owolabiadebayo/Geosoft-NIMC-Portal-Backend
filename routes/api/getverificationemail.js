const express = require("express");
const router = express.Router();
const verificationController = require("../../controllers/verificationController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .post(
    verifyRoles(ROLES_LIST.Ent),
    verificationController.getVerificationsByEmail
  );

module.exports = router;
