require("dotenv").config();

const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpEmailHtml(otp, purpose = "register") {
  const expiry = process.env.OTP_EXPIRY_MINUTES || 5;

  return `
  <div style="font-family:Arial;padding:20px">
      <h2>StudySphere AI</h2>

      <p>
      ${
        purpose === "reset-password"
          ? "Use this OTP to reset your password."
          : "Use this OTP to verify your email."
      }
      </p>

      <h1 style="letter-spacing:6px">${otp}</h1>

      <p>This OTP expires in ${expiry} minutes.</p>
  </div>
  `;
}

async function sendOtpEmail(email, otp, purpose = "register") {
  try {
    const emailData = new Brevo.SendSmtpEmail();

    emailData.subject =
      purpose === "reset-password"
        ? "StudySphere AI Password Reset OTP"
        : "StudySphere AI Email Verification OTP";

    emailData.htmlContent = otpEmailHtml(otp, purpose);

    emailData.sender = {
      email: process.env.EMAIL_FROM,
      name: "StudySphere AI",
    };

    emailData.to = [
      {
        email,
      },
    ];

    const response = await apiInstance.sendTransacEmail(emailData);

    console.log("OTP sent");
    console.log(response);

    return response;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

module.exports = {
  sendOtpEmail,
  generateOtp,
};