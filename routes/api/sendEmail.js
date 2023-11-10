const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");

// middleware to handle the file
const upload = multer();

router.post("/", upload.single("file"), (req, res) => {
  let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Boolean(process.env.SECURE),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: req.body.email, // use the email address from the request body
    subject: `Verification result from ${process.env.COMPANY_NAME}`,
    text: "Please find attached your verification result.",
    attachments: [
      {
        filename: req.file.originalname,
        content: req.file.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error: ", err);
      res.status(500).send("An error occurred");
    } else {
      console.log("Email sent successfully");
      res.status(200).send("Email sent successfully");
    }
  });
});

module.exports = router;
