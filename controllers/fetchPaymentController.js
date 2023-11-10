const { User } = require("../model/User");
const { Pay } = require("../model/Pay");

const fetchUserData = async (req, res) => {
  try {
    const userData = await User.aggregate([
      { $project: { firstName: 1, lastName: 1 } },
      {
        $lookup: {
          from: "pays", // The name of the Pay collection/table
          localField: "_id",
          foreignField: "",
          as: "payData",
        },
      },
      { $unwind: "$payData" },
      {
        $project: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          "payData.email": 1,
          "payData.amount": 1,
          "payData.totalAmount": 1,
        },
      },
    ]).exec();

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching data." });
  }
};

module.exports = fetchUserData;
