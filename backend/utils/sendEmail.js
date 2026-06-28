const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pournimacpawar@gmail.com",
    pass: "qfnoomvpmxivream", 
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"TeleMed" <pournimacpawar@gmail.com>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent to", to);
  } catch (err) {
    console.log("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;