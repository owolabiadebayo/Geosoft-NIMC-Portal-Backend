const { User, validate } = require("../model/User");
const axios = require("../api/axios");
const { StatusCodes } = require("http-status-codes");

const handleRequests = async (req, res) => {
  const { error, value } = validate(req.body);

  // Assign user role manually
  const userRole = {
    Ent: 1984,
  }; // Modify this object to assign the desired user role

  // Generate a random number for entID
  const entID = Math.floor(Math.random() * 1000) + 1; // Modify this line if you want a different range or format for entID

  if (error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: error.details[0].message });

  try {
    // Make a POST request to /api/register
    const registerResponse = await axios.post("/register", {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      roles: req.body.roles,
      password: req.body.password,
      entName: req.body.entName,
      entID: entID,
    }); // Put your actual server address

    if (registerResponse.status !== StatusCodes.CREATED) {
      return res
        .status(registerResponse.status)
        .json({ message: registerResponse.data });
    }

    // Make a POST request to /api/unit
    const unitResponse = await axios.post("/createunit", {
      email: req.body.email,
      au: 0,
      uu: 0,
    }); // Put your actual server address

    if (unitResponse.status !== StatusCodes.CREATED) {
      return res
        .status(unitResponse.status)
        .json({ message: unitResponse.data });
    }

    res.status(StatusCodes.OK).json({
      registerResponse: registerResponse.data,
      unitResponse: unitResponse.data,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  const { error, value } = validate(req.body);

  try {
    // Assign user role manually

    // Make a POST request to /api/register
    const registerResponse = await axios.post("/register", {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      roles: req.body.roles,
      password: req.body.password,
      entName: req.body.entName,
      entID: req.body.entID,
    });

    if (registerResponse.status !== StatusCodes.CREATED) {
      return res
        .status(registerResponse.status)
        .json({ message: registerResponse.data });
    }

    // Make a POST request to /api/unit
    const unitResponse = await axios.post("/createunit", {
      email: req.body.email,
      au: 0,
      uu: 0,
    });

    if (unitResponse.status !== StatusCodes.CREATED) {
      return res
        .status(unitResponse.status)
        .json({ message: unitResponse.data });
    }

    res.status(StatusCodes.OK).json({
      registerResponse: registerResponse.data,
      unitResponse: unitResponse.data,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const updateUnit = async (req, res) => {
  const { email, user } = req.body;

  try {
    // Get unit details for the provided email
    const unitResponse = await axios.get(`/unit/${email}`);
    const result = unitResponse.data;

    // Calculate available AU after deducting requested AU
    const availableAU = result.au - user.amount;

    // Check if available AU is insufficient
    if (availableAU <= 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Insufficient units to make this request." });
    }
    const usedUu = result.uu + user.amount;

    // Update unit AU by deducting requested AU
    await axios.put(`/unit/${email}`, {
      email: email,
      au: availableAU,
      uu: usedUu,
    });

    // Get unit details for the user's email
    const newUnitResponse = await axios.get(`/unit/${user.email}`);
    const newResult = newUnitResponse.data;

    // Calculate updated AU for the user
    const updatedAU = newResult.au + user.amount;

    // Update unit AU for the user
    await axios.put(`/unit/${user.email}`, {
      email: user.email,
      au: updatedAU,
      uu: newResult.uu,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Unit requests processed successfully." });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const newUnit = async (req, res) => {
  const { email, amount } = req.body;

  try {
    // Get unit details for the user's email
    const newUnitResponse = await axios.get(`/unit/${email}`);
    const newResult = newUnitResponse.data;

    // Calculate updated AU for the user
    const updatedAU = newResult.au + amount;

    // Update unit AU for the user
    await axios.put(`/unit/${email}`, {
      email: email,
      au: updatedAU,
      uu: newResult.uu,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Unit requests processed successfully." });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const updateEnable = async (req, res) => {
  const { email, enabled } = req.body;
  if (!email || enabled === undefined)
    return res.status(400).send("Both email and enabled fields are required.");

  const user = await User.findOneAndUpdate(
    { email: email },
    {
      enabled: enabled,
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The user with the given email was not found.");

  res.status(200).send(user);
};

module.exports = {
  handleRequests,
  createUser,
  updateUnit,
  newUnit,
  updateEnable,
};
