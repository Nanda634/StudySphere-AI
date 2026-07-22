require("dotenv").config();
const axios = require("axios");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpEmailHtml(otp, purpose = "register") {
  const expiry = process.env.OTP_EXPIRY_MINUTES || 5;

  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
      <h2 style="color:#2563eb;">StudySphere AI</h2>

      <p>
        ${
          purpose === "reset-password"
            ? "Use the OTP below to reset your password."
            : "Use the OTP below to verify your StudySphere AI account."
        }
      </p>

      <div style="
        font-size:40px;
        font-weight:bold;
        letter-spacing:8px;
        text-align:center;
        color:#2563eb;
        margin:20px 0;">
        ${otp}
      </div>

      <p>This OTP expires in <b>${expiry} minutes</b>.</p>
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

    console.log("OTP Sent");
    return response.data;
  } catch (err) {
    console.error(
      "Brevo Error:",
      err.response?.data || err.message
    );
    throw new Error(
      err.response?.data?.message || err.message
    );
  }
}

module.exports = {
  sendOtpEmail,
  generateOtp,
};