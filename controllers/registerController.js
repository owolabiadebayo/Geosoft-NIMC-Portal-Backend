const { User, validate } = require("../model/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const axios = require("../api/axios");
const { StatusCodes } = require("http-status-codes");
const sendEmail = require("../utils/sendEmail");
const Token = require("../model/token");

const handleNewUser = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const { error, value } = validate(req.body);
  if (error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: error.details[0].message });

  const duplicate = await User.findOne({ email: value.email }).exec();
  if (duplicate)
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: "User with given email already exists!" });

  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(value.password, salt);

    const token = crypto.randomBytes(32).toString("hex");

    let user = await new User({
      ...value,
      password: hashPassword,
      token: token,
    }).save();

    const unitResponse = await axios.post("/createunit", {
      email: value.email,
      au: 0,
      uu: 0,
    }); // Put your actual server address

    if (unitResponse.status !== StatusCodes.CREATED) {
      return res
        .status(unitResponse.status)
        .json({ message: unitResponse.data });
    }

    /*res.status(StatusCodes.OK).json({
      unitResponse: unitResponse.data,
    });*/

    const newtoken = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}users/${user.id}/verify/${newtoken.token}`;
    const message = `<table>
             <tbody>
                 
                 <tr>
                     <td style="padding:20px 30px 40px 30px;" bgcolor="#f9f9f9">
     
                         <table width="100%" cellspacing="0" cellpadding="0" border="0">
                             <tbody>
                                 <tr>
                                     <td style="padding:5px 0 20px 10px;">
                                         <strong>
                                         <p>Hello ${user.firstName}, please verify your email address by clicking the button below:</p>
                                         <a href="${url}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                                         <p>If you did not request this verification, please ignore this message.</p>
     
                                         </strong>
                                     </td>
                                 </tr>
                             
                                 <tr>
                                     <td style="padding:10px 0 10px 10px;"><strong>${process.env.COMPANY_NAME} Helpdesk</strong></td>
                                 </tr>
     
                                 <tr>
                                     <td style="padding:20px 20px 10px 20px;" align="center">
                                         Copyright © ${process.env.COMPANY_NAME} ${year}, All Rights Reserved.
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
     
                     </td>
                 </tr>
             </tbody>
         </table>`;
    await sendEmail(
      user.email,
      `${process.env.COMPANY_NAME} Email Verification`,
      message
    );
    //console.log(user.email);
    res
      .status(StatusCodes.OK)
      .send({ message: "An Email sent to your account please verify" });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(StatusCodes.OK).json(users);
};

const getUserByEmail = async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User with the given email was not found." });
  res.status(StatusCodes.OK).json(user);
};

const updateUser = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: error.details[0].message });

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(value.password, salt);

  const user = await User.findOneAndUpdate(
    { email: req.params.email },
    { ...value, password: hashPassword },
    { new: true }
  );

  if (!user)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User with the given email was not found." });

  res.status(StatusCodes.OK).json(user);
};

const deleteUser = async (req, res) => {
  const user = await User.findOneAndRemove({ email: req.params.email });
  if (!user)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User with the given email was not found." });

  res.status(StatusCodes.OK).json(user);
};

const verifyLink = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.updateOne({ _id: user._id }, { $set: { verified: true } });
    await token.remove();

    const message = `<table>
             <tbody>
                 
                 <tr>
                     <td style="padding:20px 30px 40px 30px;" bgcolor="#f9f9f9">
     
                         <table width="100%" cellspacing="0" cellpadding="0" border="0">
                             <tbody>
                                 <tr>
                                     <td style="padding:5px 0 20px 10px;">
                                         <strong>
                                         <p>Dear Administrator,</p>
                                         

                                          <p>I am pleased to inform you that the email address associated with ${user.email} has been successfully verified.</p>
     
                                         </strong>
                                     </td>
                                 </tr>
                             
                                 <tr>
                                     <td style="padding:10px 0 10px 10px;"><strong>${process.env.COMPANY_NAME} Helpdesk</strong></td>
                                 </tr>
     
                                 <tr>
                                     <td style="padding:20px 20px 10px 20px;" align="center">
                                         Copyright © ${process.env.COMPANY_NAME} ${year}, All Rights Reserved.
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
     
                     </td>
                 </tr>
             </tbody>
         </table>`;
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `${process.env.COMPANY_NAME} Email Verified`,
      message
    );

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleNewUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  deleteUser,
  verifyLink,
};
