const express = require("express");
const router = express.Router();
const fetchUserController = require("../../controllers/fetchUserController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");
router
  .route("/")
  .post(verifyRoles(ROLES_LIST.Ent), fetchUserController.fetchUsersByEntID)
  .get(verifyRoles(ROLES_LIST.Admin), fetchUserController.fetchUserData);

module.exports = router;
