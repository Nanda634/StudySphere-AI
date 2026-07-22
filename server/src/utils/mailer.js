require("dotenv").config();
const nodemailer = require("nodemailer");

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
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">
      <h2 style="color:#2563eb;">StudySphere AI</h2>

      <h3>${title}</h3>

      <p>${description}</p>

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

      <p>If you didn't request this email, simply ignore it.</p>

      <hr>

      <p style="font-size:12px;color:#666;">
        © ${new Date().getFullYear()} StudySphere AI
      </p>
    </div>
  `;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready.");
  }
});

async function sendOtpEmail(email, otp, purpose = "register") {
  try {
    const info = await transporter.sendMail({
      from: `"StudySphere AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        purpose === "reset-password"
          ? "StudySphere AI Password Reset OTP"
          : "StudySphere AI Email Verification OTP",
      html: otpEmailHtml(otp, purpose),
    });

    console.log("✅ OTP email sent successfully");
    console.log(info);

    return {
      delivered: true,
      messageId: info.messageId,
    };
  } catch (error) {
  console.error(error);
  throw new Error(`Unable to send verification email: ${error.message}`);
}
  }


module.exports = {
  sendOtpEmail,
  generateOtp,
};