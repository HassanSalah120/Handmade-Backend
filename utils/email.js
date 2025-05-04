// sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HandMade App" <${process.env.GMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // plain text
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

module.exports = sendEmail;
