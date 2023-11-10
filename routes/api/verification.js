const express = require("express");
const router = express.Router();
const verificationController = require("../../controllers/verificationController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), verificationController.getAllVerification)
  .post(
    verifyRoles(ROLES_LIST.Ent, ROLES_LIST.Admin, ROLES_LIST.User),
    verificationController.newVerification
  );
router.route("/:email").get(verificationController.getVerification);

module.exports = router;
