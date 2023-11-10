const express = require("express");
const router = express.Router();
const changePass = require("../../controllers/changePassController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User, ROLES_LIST.Ent),
    changePass.changePassword
  );

module.exports = router;
