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
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "StudySphere AI",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email }],
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
        },
      }
    );

    console.log("========== BREVO RESPONSE ==========");
    console.log(response.data);
    console.log("OTP sent to:", email);
    console.log("===================================");

    return response.data;
  } catch (err) {
    console.error("========== BREVO ERROR ==========");
    console.error(err.response?.data || err.message);
    console.error("================================");
    throw err;
  }
}

module.exports = {
  generateOtp,
  sendOtpEmail,
};