const { Pay, validatePay } = require("../model/Pay");
const { User } = require("../model/User");
const { StatusCodes } = require("http-status-codes");

const paymentController = async (req, res) => {
  const { error, value } = validatePay(req.body);

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, message: error.details[0].message });
  }

  try {
    const newPayment = new Pay(value);
    const savedPayment = await newPayment.save();

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: savedPayment });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while saving the payment.",
    });
  }
};

const fetchPayData = async (req, res) => {
  try {
    const pays = await Pay.find().sort({ datefield: -1 });
    const userData = [];

    for (const pay of pays) {
      const user = await User.findOne({ email: pay.email });

      let userInfo = null;
      if (user) {
        userInfo = {
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }

      userData.push({
        email: pay.email,
        amount: pay.amount,
        reference: pay.reference,
        date: pay.datefield,
        totalAmount: pay.totalAmount,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
      });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchPayEmail = async (req, res) => {
  try {
    const pays = await Pay.find({ email: req.params.id }).sort({
      datefield: -1,
    });
    const userData = [];

    for (const pay of pays) {
      const user = await User.findOne({ email: pay.email });

      let userInfo = null;
      if (user) {
        userInfo = {
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }

      userData.push({
        email: pay.email,
        amount: pay.amount,
        reference: pay.reference,
        date: pay.datefield,
        totalAmount: pay.totalAmount,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
      });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { paymentController, fetchPayData, fetchPayEmail };
