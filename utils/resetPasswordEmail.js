// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const email = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASSWORD;

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:email,
      pass: password,
    },
  });

  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
