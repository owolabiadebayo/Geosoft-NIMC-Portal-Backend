const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the user schema
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  roles: {
    Admin: Number,
    User: Number,
    Ent: Number,
    Disable: Number,
    Permit: Number,
  },
  password: { type: String, required: true },
  refreshToken: String,
  entName: { type: String, required: false },
  entID: { type: Number, required: false },
  token: { type: String, required: false },
  datefield: { type: Date, default: Date.now },
  enabled: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
});

// Validation function using Joi
const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    roles: Joi.object({
      Admin: Joi.number().optional(),
      User: Joi.number().optional(),
      Ent: Joi.number().optional(),
      Disable: Joi.number().optional(),
      Permit: Joi.number().optional(),
    })
      .or("Admin", "User", "Ent", "Disable", "Permit")
      .required()
      .label("Roles"),
    password: passwordComplexity().required().label("Password"),
    entName: Joi.string().allow("").min(1).label("Enterprise Name"),
    entID: Joi.number().allow("").min(1).label("Enterprise ID"),
    token: Joi.string().allow("").min(1).label("Token"),
  });
  return schema.validate(data);
};

// Create the User model
const User = mongoose.model("User", userSchema);

// Export the User model and validate function
module.exports = { User, validate };
