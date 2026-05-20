const nodemailer = require("nodemailer");

// ✅ CREATE TRANSPORTER (GLOBAL)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pournimacpawar@gmail.com",
    pass: "qfnoomvpmxivream", 
  },
});

// ✅ SINGLE FUNCTION EXPORT
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