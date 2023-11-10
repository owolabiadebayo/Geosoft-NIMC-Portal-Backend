const { Unit, validateUnit } = require("../model/Unit");
const HttpStatus = require("http-status-codes");

const createUnit = async (req, res) => {
  const { error } = validateUnit(req.body);
  if (error)
    return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

  let unit = new Unit({
    email: req.body.email,
    au: req.body.au,
    uu: req.body.uu,
  });

  unit = await unit.save();

  res.status(HttpStatus.CREATED).send(unit);
};

const getUnits = async (req, res) => {
  const units = await Unit.find().sort("email");
  res.status(HttpStatus.OK).send(units);
};

const getUnitByEmail = async (req, res) => {
  const unit = await Unit.findOne({ email: req.params.email });

  if (!unit)
    return res
      .status(HttpStatus.NOT_FOUND)
      .send("The unit with the given email was not found.");

  res.status(HttpStatus.OK).send(unit);
};

const updateUnit = async (req, res) => {
  const { error } = validateUnit(req.body);
  if (error)
    return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

  const unit = await Unit.findOneAndUpdate(
    { email: req.params.email },
    {
      email: req.body.email,
      au: req.body.au,
      uu: req.body.uu,
    },
    { new: true }
  );

  if (!unit)
    return res
      .status(HttpStatus.NOT_FOUND)
      .send("The unit with the given email was not found.");

  res.status(HttpStatus.OK).send(unit);
};

const deleteUnit = async (req, res) => {
  const unit = await Unit.findOneAndRemove({ email: req.params.email });

  if (!unit)
    return res
      .status(HttpStatus.NOT_FOUND)
      .send("The unit with the given email was not found.");

  res.status(HttpStatus.OK).send(unit);
};

const createNewUnit = async (req, res) => {
  try {
    const result = await Unit.create({
      ...req.body,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createUnit,
  getUnits,
  getUnitByEmail,
  updateUnit,
  deleteUnit,
  createNewUnit,
};
