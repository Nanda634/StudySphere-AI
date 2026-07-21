require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false for port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

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
      ? "Use the OTP below to reset your StudySphere AI account password."
      : "Use the OTP below to verify your StudySphere AI account.";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

<tr>
<td style="background:#0f172a;padding:30px;text-align:center;">
<h1 style="color:#38bdf8;margin:0;">StudySphere AI</h1>
<p style="color:#cbd5e1;margin-top:8px;">
AI Powered Learning Platform
</p>
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2 style="margin-top:0;color:#111827;">
${title}
</h2>

<p style="color:#4b5563;font-size:15px;">
${description}
</p>

<div
style="
margin:30px auto;
width:220px;
background:#eff6ff;
border:2px dashed #2563eb;
border-radius:12px;
padding:20px;
text-align:center;
font-size:36px;
font-weight:bold;
letter-spacing:8px;
color:#2563eb;
">
${otp}
</div>

<p style="color:#6b7280;">
This OTP will expire in
<b>${expiry} minutes</b>.
</p>

<p style="color:#6b7280;">
If you didn't request this email,
you can safely ignore it.
</p>

</td>
</tr>

<tr>
<td
style="
background:#f8fafc;
padding:18px;
text-align:center;
color:#64748b;
font-size:13px;
">
© ${new Date().getFullYear()} StudySphere AI
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

async function sendOtpEmail(email, otp, purpose = "register") {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject:
        purpose === "reset-password"
          ? "StudySphere AI Password Reset OTP"
          : "StudySphere AI Email Verification OTP",
      html: otpEmailHtml(otp, purpose),
      text: `Your StudySphere AI OTP is ${otp}. It expires in ${
        process.env.OTP_EXPIRY_MINUTES || 5
      } minutes.`,
    });

    console.log(`✅ OTP email sent to ${email}`);
    console.log("Message ID:", info.messageId);

    return {
      delivered: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error);

    throw new Error(
      "Unable to send verification email. Please try again later."
    );
  }
}

module.exports = {
  sendOtpEmail,
  generateOtp,
};