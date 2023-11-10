const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const paySchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
  datefield: { type: Date, default: Date.now },
});

const validatePay = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    amount: Joi.number().required().label("Amount"),
    totalAmount: Joi.string().required().label("Toal amonunt"),
    reference: Joi.string().required().label("Reference"),
  });
  return schema.validate(data);
};

module.exports = {
  Pay: mongoose.model("Pay", paySchema),
  validatePay,
};
