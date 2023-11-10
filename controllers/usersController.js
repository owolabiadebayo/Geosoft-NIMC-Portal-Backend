const { User } = require("../model/User");
const httpStatus = require("http-status-codes");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.id} not found` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

const updateRole = async (req, res) => {
  const { email, roles } = req.body; // Get the email and role from the request body

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { roles: { ...roles } } },
      { new: true }
    ); // Find the user by email and update their roles field

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Return an error if the user is not found
    }

    return res
      .status(200)
      .json({ message: "Roles updated successfully", user }); // Return a success message with the updated user object
  } catch (err) {
    return res.status(500).json({ message: err.message }); // Return an error if something goes wrong
  }
};

async function getTotalUserCount(req, res) {
  try {
    const totalUserCount = await User.countDocuments();

    res.status(httpStatus.OK).json({
      totalUserCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while retrieving the total user count.",
    });
  }
}

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  updateRole,
  getTotalUserCount,
};
