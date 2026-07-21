require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpEmailHtml(otp, purpose = "register") {
  const expiry = process.env.OTP_EXPIRY_MINUTES || 5;

  const title =
    purpose === "reset-password"
      ? "Reset Your Password"
      : "Verify Your Email";

  const description =
    purpose === "reset-password"
      ? "Use the OTP below to reset your password."
      : "Use the OTP below to verify your StudySphere AI account.";

  return `
<h2>${title}</h2>

<p>${description}</p>

<h1 style="font-size:40px;letter-spacing:6px;">${otp}</h1>

<p>This OTP expires in ${expiry} minutes.</p>

<p>If you didn't request this email, simply ignore it.</p>
`;
}

async function sendOtpEmail(email, otp, purpose = "register") {
  try {
    const response = await resend.emails.send({
      from: "StudySphere AI <onboarding@resend.dev>",
      to: email,
      subject:
        purpose === "reset-password"
          ? "StudySphere AI Password Reset OTP"
          : "StudySphere AI Email Verification OTP",
      html: otpEmailHtml(otp, purpose),
    });

    console.log("✅ OTP email sent");
    console.log(response);

    return {
      delivered: true,
      id: response.data?.id,
    };
  } catch (err) {
    console.error(err);

    throw new Error("Unable to send verification email.");
  }
}

module.exports = {
  sendOtpEmail,
  generateOtp,
};