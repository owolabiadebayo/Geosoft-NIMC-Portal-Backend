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
  //const command = `echo ${publicPayload} | base64 -d | openssl rsautl -decrypt -oaep -inkey ${publicKeyPath}`;
  const command = `echo ${publicPayload} | base64 -d | openssl pkeyutl -decrypt -inkey ${publicKeyPath} -pkeyopt rsa_padding_mode:oaep`;
  const stringdecryptedPayload = execSync(command).toString();
  return JSON.parse(stringdecryptedPayload);
};

const newVerification = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    let datar = qs.stringify({
      agentID: process.env.AGENT_ID,
      vNIN: req.body.idno,
      RPShortCode: process.env.SHORTCODE,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.VNIN_URL,
      headers: {
        "x-api-key": process.env.X_API_KEY,
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
          if (
            updatedData.firstName.toLowerCase() ===
              req.body.firstname.toLowerCase() &&
            updatedData.surname.toLowerCase() ===
              req.body.lastname.toLowerCase()
          ) {
            let remarkt = "Provided information matches verification result";
            const verify = await new verification({
              ...req.body,
              success: data.success,
              remark: remarkt,
              dataU: decryptedPayload,
            }).save();
          } else {
            let remarkt =
              "Provided information does not match verification result";
            const verify = await new verification({
              ...req.body,
              success: data.success,
              remark: remarkt,
              dataU: decryptedPayload,
            }).save();
          }

          res.status(200).json({ message: updatedData, success: data.success });
        } else {
          let remarkt = "vNIN does not exist";
          const verify = await new verification({
            ...req.body,
            success: data.success,
            remark: remarkt,
          }).save();
          res.status(500).json({ message: data.message });
        }
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });

    /*const decryptedData = decrypt(data);
    
        console.log(decryptedData);*/

    // Send response with updated data
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVerification = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) return res.status(400).json({ message: "Email is required." });

    const units = await verification
      .find({ email: email })
      .sort({ datefield: -1 })
      .exec();

    if (units.length === 0)
      return res.status(204).json({ message: "No verification found." });

    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllVerification = async (req, res) => {
  try {
    const verify = await verification.find().sort({ datefield: -1 }).exec();

    if (verify.length === 0)
      return res.status(204).json({ message: "No verification found." });

    res.json(verify);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getVerificationsByEmail(req, res, next) {
  const { email } = req.body;
  // Check if the token is valid

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  //const user = await User.findOne({ email });

  //console.log(user.roles);

  // Check if the user has the required privilege

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

async function getTotalVerificationCountByEmail(req, res) {
  const email = req.params.email;

  try {
    //console.log(1);
    const count = await verification.count({ email: email });
    res.status(StatusCodes.OK).json({ count });
  } catch (error) {
    console.error("Error in getting verification count:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred" });
  }
}

module.exports = {
  newVerification,
  getVerification,
  getAllVerification,
  getVerificationsByEmail,
  getTotalVerificationCountByEmail,
};
