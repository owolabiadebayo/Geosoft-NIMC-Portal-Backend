const bcrypt = require("bcrypt");
const { verification, validate } = require("../model/verification");
const Unit = require("../model/Unit");
const { User } = require("../model/User");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bwipjs = require("bwip-js");
const axio = require("../api/axios");
const axios = require("axios");
const qs = require("qs");
const { StatusCodes } = require("http-status-codes");

const publicKeyPath = "publickey.key";
// const publicKey = fs.readFileSync(publicKeyPath).toString().trim();

const generateQRCode = async (options) => {
  const qrOptions = {
    ...options,
    bcid: "qrcode", // set the barcode type to qrcode
  };

  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(qrOptions, (err, png) => {
      if (err) {
        reject(err);
      } else {
        resolve(png);
      }
    });
  });
};

const decryptPayload = (publicPayload) => {
  const command = `echo ${publicPayload} | base64 -d | openssl pkeyutl -decrypt -inkey ${publicKeyPath} -pkeyopt rsa_padding_mode:oaep`;
  const stringdecryptedPayload = execSync(command).toString();
  return JSON.parse(stringdecryptedPayload);
};

const newVerification = async (req, res) => {
  try {
    const token = req.body.token;
    const email = req.body.verify.email;

    const user = await User.findOne({ email, token });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token or user not found." });
    }
    // const { error } = validate(req.body.verify);
    // if (error) {
    //   return res.status(400).send({ message: error.details[0].message });
    // }

    // const unitResponse = await axio.get(`/unit/${email}`);

    // const result = unitResponse.data;

    // // Calculate available AU after deducting requested AU
    // const availableAU = result.au - 1;

    // // Check if available AU is insufficient
    // if (availableAU <= 0) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .json({ message: "Insufficient units to make this request." });
    // }
    // const usedUu = result.uu + 1;

    // await axio.put(`/unit/${email}`, {
    //   email: email,
    //   au: availableAU,
    //   uu: usedUu,
    // });

    let datar = qs.stringify({
      agentID: "MQSSKY-4549",
      vNIN: req.body.verify.idno,
      RPShortCode: "119887",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://tk.nimc.gov.ng/api/v1/apiVerification/enterprise/direct/vNIN",
      headers: {
        "x-api-key": "dgmP5YTlXyYy7SGGzjJKL5nj3f&Le%Pmxxnh&nbn",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: datar,
    };

    axios
      .request(config)
      .then(async (response) => {
        const jsonStr = JSON.stringify(response.data);
        const data = JSON.parse(jsonStr);
        //console.log(data);
        if (data.data) {
          fs.writeFileSync("publicpayload.b64", data.data);
          const publicPayloadPath = "publicpayload.b64";

          const publicPayload = fs
            .readFileSync(publicPayloadPath)
            .toString()
            .trim();

          //const command = `echo ${publicPayload} | base64 -d | openssl rsautl -decrypt -oaep -inkey ${publicKeyPath}`;

          const command = `echo ${publicPayload} | base64 -d | openssl pkeyutl -decrypt -inkey ${publicKeyPath} -pkeyopt rsa_padding_mode:oaep`;

          const stringdecryptedPayload = execSync(command).toString();

          const decryptedPayload = JSON.parse(stringdecryptedPayload);
          //console.log(decryptedPayload);
          // Assuming decryptedPayload is a JSON object
          const png = await generateQRCode({
            text: JSON.stringify(decryptedPayload),
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          });

          const updatedData = {
            ...decryptedPayload,
            photograph: data.photograph,
            barcode: png.toString("base64"),
          };
          //console.log(updatedData.firstName);
          //console.log(req.body.firstname);
          // Remove userid and agentID properties
          const { userid, agentID, ...messageData } = updatedData;

          let remarkt =
            messageData.firstName.toLowerCase() ===
              req.body.verify.firstname.toLowerCase() &&
            messageData.surname.toLowerCase() ===
              req.body.verify.lastname.toLowerCase()
              ? "Provided information matches verification result"
              : "Provided information does not match verification result";

          const verify = await new verification({
            ...req.body.verify,
            success: data.success,
            remark: remarkt,
            dataU: decryptedPayload,
          }).save();

          res.status(200).json({ message: messageData, success: data.success });
        } else {
          let remarkt = "vNIN does not exist";
          const verify = await new verification({
            ...req.body.verify,
            success: data.success,
            remark: remarkt,
          }).save();
          res.status(500).json({ message: data.message });
        }
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerification = async (req, res) => {
  try {
    const { email, token } = req.body;
    // Check if the token is valid

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email, token });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token or user not found." });
    }

    const unit = await verification.find({ email }).exec();

    if (unit.length === 0) {
      return res.status(204).json({ message: "No verification found" });
    }

    res.status(StatusCodes.OK).json(unit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllVerification = async (req, res) => {
  try {
    const { email, token } = req.body;
    // Check if the token is valid

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email, token });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token or user not found." });
    }

    //console.log(user.roles);

    // Check if the user has the required privilege
    if (!user.roles || user.roles.Admin !== 5150) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "You are not privileged to perform this action." });
    }
    const verify = await verification.find();

    if (!verify) {
      return res.status(204).json({ message: "No verification found." });
    }

    res.status(StatusCodes.OK).json(verify);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getVerificationsByEmail(req, res, next) {
  const { email, token } = req.body;
  // Check if the token is valid

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  const user = await User.findOne({ email, token });

  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token or user not found." });
  }

  //console.log(user.roles);

  // Check if the user has the required privilege
  if (!user.roles || user.roles.Ent !== 1984) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "You are not privileged to perform this action." });
  }

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `User with email ${email} not found` });
    }

    // Step 2: Find users by the entID
    const usersWithSameEntId = await User.find({ entID: user.entID });

    if (usersWithSameEntId.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No users found with entID ${user.entID}` });
    }

    // Extract their emails
    const emails = usersWithSameEntId.map((user) => user.email);

    // Step 3: Find verifications by emails
    const verifications = await verification.find({ email: { $in: emails } });

    if (verifications.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `No verifications found for emails ${emails.join(", ")}`,
      });
    }

    // Return the verifications
    return res.status(StatusCodes.OK).json(verifications);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `An error occurred: ${error.message}` });
  }
}

module.exports = {
  newVerification,
  getVerification,
  getAllVerification,
  getVerificationsByEmail,
};
