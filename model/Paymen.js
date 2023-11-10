const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const unitSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  au: {
    type: Number,
    required: true,
  },
  uu: {
    type: Number,
    required: true,
  },
});

const validateUnit = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    au: Joi.number().required().label("AU"),
    uu: Joi.number().required().label("UU"),
  });
  return schema.validate(data);
};

module.exports = {
  Unit: mongoose.model("Unit", unitSchema),
  validateUnit,
};
