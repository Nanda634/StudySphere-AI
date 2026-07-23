require("dotenv").config();
const axios = require("axios");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpEmailHtml(otp, purpose = "register") {
  const expiry = process.env.OTP_EXPIRY_MINUTES || 5;

  return `
    <div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#2563eb;">StudySphere AI</h2>

      <p>
        ${
          purpose === "reset-password"
            ? "Use the OTP below to reset your password."
            : "Use the OTP below to verify your email."
        }
      </p>

      <h1 style="letter-spacing:6px;color:#2563eb;">${otp}</h1>

      <p>This OTP expires in ${expiry} minutes.</p>
    </div>
  `;
}

async function sendOtpEmail(email, otp, purpose = "register") {
  try {
    console.log("====================================");
    console.log("Sending OTP Email");
    console.log("Recipient :", email);
    console.log("Sender    :", process.env.EMAIL_FROM);
    console.log("OTP        :", otp);
    console.log("Purpose    :", purpose);
    console.log("====================================");

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "StudySphere AI",
          email: process.env.EMAIL_FROM,
        },
        to: [
          {
            email: email,
          },
        ],
        subject:
          purpose === "reset-password"
            ? "StudySphere AI Password Reset OTP"
            : "StudySphere AI Email Verification OTP",
        htmlContent: otpEmailHtml(otp, purpose),
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("========== BREVO SUCCESS ==========");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
    console.log("==================================");

    return response.data;
  } catch (err) {
    console.log("=========== BREVO ERROR ===========");
    console.log("Status:", err.response?.status);
    console.log("Response:", err.response?.data);
    console.log("Message:", err.message);
    console.log("===================================");

    throw err;
  }
}

module.exports = {
  generateOtp,
  sendOtpEmail,
};