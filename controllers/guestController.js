const { verification } = require("../model/verification");
const { execSync } = require("child_process");
const fs = require("fs");
const bwipjs = require("bwip-js");
const axios = require("axios");
const qs = require("qs");
const { StatusCodes } = require("http-status-codes");
const Joi = require("joi");

const publicKeyPath = "publickey.key";

const generateRandomNumber = () => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random number between 10000 and 99999
  return randomNumber;
};

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
  const stringDecryptedPayload = execSync(command).toString();
  return JSON.parse(stringDecryptedPayload);
};

const newVerification = async (req, res) => {
  try {
    const randomString = `guest${generateRandomNumber()}`;
    const { error, value } = validate(req.body);

    if (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ success: false, message: error.details[0].message });
    }

    const datar = qs.stringify({
      agentID: process.env.AGENT_ID,
      vNIN: value.vnin,
      RPShortCode: process.env.SHORTCODE,
    });

    const config = {
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
        const data = response.data;

        if (data.data) {
          fs.writeFileSync("publicpayload.b64", data.data);
          const publicPayloadPath = "publicpayload.b64";
          const publicPayload = fs
            .readFileSync(publicPayloadPath, "utf-8")
            .trim();

          const decryptedPayload = decryptPayload(publicPayload);

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

          const vdata = {
            firstname: value.firstname,
            lastname: value.lastname,
            phone: value.phone,
            idno: value.vnin,
            idtype: "VNIN",
            email: value.vemail,
            reference: randomString,
            preference: "",
          };

          if (
            updatedData.firstName.toLowerCase() ===
              value.firstname.toLowerCase() &&
            updatedData.surname.toLowerCase() === value.lastname.toLowerCase()
          ) {
            let remarkt = "Provided information matches verification result";
            const verify = await new verification({
              ...vdata,
              success: data.success,
              remark: remarkt,
              dataU: decryptedPayload,
            }).save();
          } else {
            let remarkt =
              "Provided information does not match verification result";
            const verify = await new verification({
              ...vdata,
              success: data.success,
              remark: remarkt,
              dataU: decryptedPayload,
            }).save();
          }

          /*const verify = await verification.create({
            ...vdata,
            success: data.success,
            dataU: decryptedPayload,
          });*/

          res
            .status(StatusCodes.OK)
            .json({ success: data.success, message: updatedData });
        } else {
          const remarkt = "vNIN does not exist";
          const vdata = {
            firstname: value.firstname,
            lastname: value.lastname,
            phone: value.phone,
            idno: value.vnin,
            idtype: "VNIN",
            email: value.vemail,
            reference: randomString,
            preference: "",
          };

          const verify = await verification.create({
            ...vdata,
            success: data.success,
            remark: remarkt,
          });

          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: data.success, message: data.message });
        }
      })
      .catch((error) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: error.message });
      });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const validate = (data) => {
  const schema = Joi.object({
    firstname: Joi.string().required().label("Firstname"),
    lastname: Joi.string().required().label("Lastname"),
    phone: Joi.number().required().label("Phone Number"),
    vemail: Joi.string().email().required().label("Email"),
    vnin: Joi.string().required().label("vNIN"),
  });
  return schema.validate(data);
};

module.exports = {
  newVerification,
};
