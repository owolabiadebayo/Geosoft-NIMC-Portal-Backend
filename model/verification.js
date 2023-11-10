const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const verificationSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true },
  success: {
    type: String,
    required: true,
  },
  idno: {
    type: String,
    required: true,
  },
  idtype: {
    type: String,
    required: true,
  },
  email: { type: String, required: true },
  reference: {
    type: String,
    required: true,
  },
  preference: { type: String, required: false },
  remark: { type: String, default: null },
  datefield: { type: Date, default: Date.now },
  dataU: { type: Object, default: null },
});

const validate = (data) => {
  const schema = Joi.object({
    firstname: Joi.string().required().label("First Name"),
    lastname: Joi.string().required().label("Last Name"),
    phone: Joi.number().required().label("Phone"),
    idno: Joi.string().required().label("Identification Number"),
    idtype: Joi.string().required().label("Identification Type"),
    email: Joi.string().email().required().label("Email"),
    reference: Joi.string().required().label("Reference Number"),
    preference: Joi.string().allow("").min(1).label("Payment Reference"),
  });

  return schema.validate(data);
};

const verification = mongoose.model("verification", verificationSchema);

module.exports = { verification, validate };
