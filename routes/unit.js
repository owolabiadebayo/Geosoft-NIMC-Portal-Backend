const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");

router.post("/", unitController.createUnit);
router.get("/", unitController.getUnits);
router.get("/:email", unitController.getUnitByEmail);
router.put("/:email", unitController.updateUnit);
router.delete("/:email", unitController.deleteUnit);

module.exports = router;
