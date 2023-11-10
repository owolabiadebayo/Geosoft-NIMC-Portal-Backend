const { User } = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Token = require("../model/token");

const handleLogin = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const { email, password } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const foundUser = await User.findOne({ email: req.body.email }).exec();
  if (!foundUser)
    return res.status(401).send({ message: "Invalid Email or Password" }); //Unauthorized;
  // evaluate password
  if (!foundUser.verified) {
    let token = await Token.findOne({ userId: foundUser._id });
    if (!token) {
      token = await new Token({
        userId: foundUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.BASE_URL}users/${foundUser.id}/verify/${token.token}`;
      const message = `<table>
             <tbody>
                 
                 <tr>
                     <td style="padding:20px 30px 40px 30px;" bgcolor="#f9f9f9">
     
                         <table width="100%" cellspacing="0" cellpadding="0" border="0">
                             <tbody>
                                 <tr>
                                     <td style="padding:5px 0 20px 10px;">
                                         <strong>
                                         <p>Hello ${foundUser.firstName}, please verify your email address by clicking the button below:</p>
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
        foundUser.email,
        `${process.env.COMPANY_NAME} Email Verification`,
        message
      );
    }

    return res
      .status(400)
      .send({ message: "An Email sent to your account please verify" });
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    //console.log(result);
    //console.log(roles);

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ result, roles, accessToken });
  } else {
    return res.status(401).send({ message: "Invalid Email or Password" });
  }
};

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = { handleLogin };
