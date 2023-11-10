const { User } = require("../model/User");
const { Unit } = require("../model/Unit");

const fetchUserData = async (req, res) => {
  try {
    const ROLES_LIST = {
      Admin: 5150,
      Ent: 1984,
      User: 2001,
      Disable: 1001,
      Permit: 3600,
    };
    // Find all users
    const users = await User.find();

    // Create an array to store the user data
    const userData = [];

    // Iterate over each user
    for (const user of users) {
      // Find the unit with the matching email
      const unit = await Unit.findOne({ email: user.email });
      //console.log(unit);

      // Extract the required fields from the user and unit objects
      const {
        firstName,
        lastName,
        email,
        roles,
        entName,
        entID,
        enabled,
        verified,
      } = user;
      const { au, uu } = unit;

      // Determine the selected option for the role select input
      let selectedRole = "User";
      if (roles.Admin === ROLES_LIST.Admin) {
        selectedRole = "Administrator";
      } else if (roles.Ent === ROLES_LIST.Ent) {
        selectedRole = "Enterprise";
      } else if (roles.Permit === ROLES_LIST.Permit) {
        selectedRole = "Permit";
      }

      // Add the extracted data to the userData array
      userData.push({
        firstName,
        lastName,
        email,
        roles,
        entName,
        au,
        uu,
        selectedRole,
        entID, // Add the selected role for the select input
        enabled,
        verified,
      });
    }

    // Send the user data as a JSON response
    res.status(200).json(userData);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchUsersByEntID = async (req, res) => {
  const { entID } = req.body;

  try {
    // Step 1: Fetch users with entID and specified fields
    const users = await User.find({ entID }).select(
      "firstName lastName email roles entName entID enabled verified"
    );

    // Step 2: Fetch units where users.username matches unit.email and specified fields
    const email = users.map((user) => user.email);
    const units = await Unit.find({ email: { $in: email } }).select(
      "email au uu"
    );
    // console.log(units);

    // Combine user and unit data into a single row
    const mergedData = users.map((user) => {
      const unit = units.find((unit) => unit.email === user.email);
      //sconst { au, uu } = unit;
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        entName: user.entName,
        entID: user.entID,
        enabled: user.enabled,
        verified: user.verified,
        au: unit ? unit.au : null,
        uu: unit ? unit.uu : null,
      };
    });

    // Display matching results
    res.json({ mergedData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  fetchUserData,
  fetchUsersByEntID,
};
