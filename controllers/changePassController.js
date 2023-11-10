const { User } = require("../model/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

const strongPwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function generatePassword(length = 8) {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const specialChars = "!@#$%^&*()_+-={}[];',.";
  const numericChars = "0123456789";
  const allChars =
    uppercaseChars + lowercaseChars + specialChars + numericChars;

  let password = "";

  for (let i = 0; i < length; i++) {
    const charSet =
      i % 4 === 0
        ? uppercaseChars
        : i % 4 === 1
        ? lowercaseChars
        : i % 4 === 2
        ? specialChars
        : numericChars;
    const randomChar = charSet.charAt(
      Math.floor(Math.random() * charSet.length)
    );
    password += randomChar;
  }

  return password;
}

const changePassword = async (req, res) => {
  try {
    if (!req?.body?.email) {
      return res.status(400).json({ message: "email is required." });
    }

    const user = await User.findOne({
      email: req.body.email,
    }).exec();
    if (!user) {
      return res
        .status(204)
        .json({ message: `No user detail matches email ${req.body.email}.` });
    }

    const pwd = req.body.pwd;
    if (!pwd.match(strongPwdRegex)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const hashedPwd = await bcrypt.hash(pwd, 10);
    user.email = req.body.email;
    user.password = hashedPwd;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const sendPassword = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  try {
    if (!req?.body?.email) {
      return res.status(400).json({ message: "email is required." });
    }

    const user = await User.findOne({
      email: req.body.email,
    }).exec();
    if (!user) {
      return res
        .status(204)
        .json({ message: `No user detail matches email ${req.body.email}.` });
    }
    const password = generatePassword(12);
    const pwd = password;

    const hashedPwd = await bcrypt.hash(pwd, 10);
    user.email = req.body.email;
    user.password = hashedPwd;
    const updatedUser = await user.save();
    if (updatedUser) {
      const message = `<table>
    <tbody>
        <tr>
            <td style="padding:20px 30px 40px 30px;" bgcolor="#f9f9f9">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                        <tr>
                            <td style="padding:5px 0 20px 10px;">
                                <strong>
                                    <p>Hello ${user.firstName},</p>
                                    <p>Thank you for your password reset request. We have generated a new password for your ${
                                      process.env.COMPANY_NAME
                                    } account.</p>
                                    <p>Please follow the instructions below to complete the password reset process:</p>
                                    <ol>
                                        <li>Visit the ${
                                          process.env.COMPANY_NAME
                                        } login page: ${
        process.env.COMPANY_URL
      }</li>
                                        <li>Click on the "Forgot Password" link.</li>
                                        <li>Enter your registered email address: ${
                                          user.email
                                        }</li>
                                        <li>Use the following temporary password to log in:</li>
                                    </ol>
                                    <p>Temporary Password: ${pwd}</p>
                                    <p>Once logged in, click on Change Password to create a new password of your choice. Please ensure that your new password meets the required security criteria.</p>
                                    <p>If you did not request a password reset, please disregard this email and ensure the security of your account.</p>
                                    <p>If you have any questions or need further assistance, please contact our support team at ${
                                      process.env.COMPANY_SUPPORT
                                    } or visit our website ${
        process.env.COMPANY_URL
      }.</p>
                                    <br>
                                    <p>Thank you for your attention to this matter.</p>
                                </strong>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0 10px 10px;"><strong>${
                              process.env.COMPANY_NAME
                            } Helpdesk</strong></td>
                        </tr>
                        <tr>
                            <td style="padding:20px 20px 10px 20px;" align="center">
                                &copy; ${
                                  process.env.COMPANY_NAME
                                } ${new Date().getFullYear()}, All Rights Reserved.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;

      await sendEmail(
        req.body.email,
        `Password Reset Request - Action Required for Your ${process.env.COMPANY_NAME} Account`,
        message
      );

      res.status(200).send({ message: "New password sent to your email" });
    }

    //res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { changePassword, sendPassword };
