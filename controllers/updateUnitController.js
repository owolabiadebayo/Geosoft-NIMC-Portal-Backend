const { Unit } = require("../model/Unit");
const httpStatus = require("http-status-codes");

const Joi = require("joi");

const addToAuSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
});

// Controller function to update unit values
const updateUnitValues = async (req, res) => {
  const { email } = req.body;

  try {
    const unit = await Unit.findOne({ email });

    if (unit.au > 0) {
      unit.au--;
      unit.uu++;
      await unit.save();

      res.status(200).json({
        success: true,
        message: "Unit values updated successfully.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "insufficient Unit to make request.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating unit values.",
    });
  }
};

// Controller function to add to AU value
async function addToAu(req, res) {
  const { error } = addToAuSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { email, amount } = req.body;

  try {
    const unit = await Unit.findOne({ email });

    unit.au += amount;
    await unit.save();

    res.status(200).json({
      success: true,
      message: "Unit added successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating unit.",
    });
  }
}

async function getUnitByEmail(req, res) {
  const { email } = req.params;

  try {
    const unit = await Unit.findOne({ email });

    if (!unit) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Unit not found.",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while retrieving unit.",
    });
  }
}

const getUnit = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) return res.status(400).json({ message: "Email is required." });

    const unit = await Unit.findOne({ email: email }).exec();
    if (!unit) return res.status(204).json({ message: "user not found" });

    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTotalAuAndUuCount = async (req, res) => {
  try {
    const units = await Unit.find({}, { au: 1, uu: 1 });
    let totalAuCount = 0;
    let totalUuCount = 0;

    units.forEach((unit) => {
      totalAuCount += unit.au;
      totalUuCount += unit.uu;
    });

    res.status(httpStatus.OK).send({
      tau: totalAuCount,
      tuu: totalUuCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while retrieving the total counts.",
    });
  }
};

module.exports = {
  updateUnitValues,
  addToAu,
  getUnitByEmail,
  getUnit,
  getTotalAuAndUuCount,
};
