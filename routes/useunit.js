const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");
const {
  updateUnitValues,
  getUnitByEmail,
  getTotalAuAndUuCount,
} = require("../controllers/updateUnitController");

router.route("/").post(updateUnitValues);
router.route("/").get(verifyRoles(ROLES_LIST.Admin), getTotalAuAndUuCount);
router.route("/:email").get(getUnitByEmail);

module.exports = router;
