const express = require("express");
const router = express.Router();
const updateUnitController = require("../../controllers/updateUnitController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User, ROLES_LIST.Ent),
    updateUnitController.addToAu
  );
router
  .route("/:email")
  .get(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User, ROLES_LIST.Ent),
    updateUnitController.getUnit
  );

module.exports = router;
