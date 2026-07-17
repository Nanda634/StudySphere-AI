// Sends OTP verification emails via SMTP (nodemailer). Works with Gmail, Outlook, SendGrid,
// Mailtrap, or any standard SMTP provider — just set the SMTP_* vars in server/.env.
//
// If SMTP isn't configured yet (e.g. during local dev before you've set credentials), we don't
// crash the request — we log the OTP to the server console instead, so you can still test the
// flow end-to-end. Real emails only go out once SMTP_HOST/SMTP_USER/SMTP_PASS are set.
require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;
let loggedMissingConfig = false;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/25
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

function otpEmailHtml(otp, purpose) {
  const action =
    purpose === "register"
      ? "verify your email and finish creating your account"
      : purpose === "reset-password"
      ? "reset your password"
      : "verify your email";
  const heading = purpose === "reset-password" ? "Reset your password" : "Verify your email";
  return `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2 style="color:#04AA6D;margin-bottom:4px;">StudySphere AI</h2>
    <p style="color:#333;font-size:15px;font-weight:600;">${heading}</p>
    <p style="color:#333;font-size:15px;">Use the code below to ${action}. It expires in
      ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f2f2f2;color:#111;
      padding:16px 0;text-align:center;border-radius:10px;margin:20px 0;">${otp}</div>
    <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email${purpose === "reset-password" ? " — your password will stay unchanged" : ""}.</p>
  </div>`;
}

// Sends the OTP. In dev-without-SMTP mode, logs it to the console and resolves successfully
// so the registration flow keeps working while you're setting up SMTP credentials.
async function sendOtpEmail(email, otp, purpose = "register") {
  if (!isConfigured()) {
    if (!loggedMissingConfig) {
      console.warn(
        "[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS not set in server/.env — OTPs will be printed " +
          "to this console instead of emailed. Set them to send real emails."
      );
      loggedMissingConfig = true;
    }
    console.log(`[mailer] OTP for ${email} (${purpose}): ${otp}`);
    return { delivered: false, devMode: true };
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: purpose === "reset-password" ? "Your StudySphere AI password reset code" : "Your StudySphere AI verification code",
    html: otpEmailHtml(otp, purpose),
    text: `Your StudySphere AI ${purpose === "reset-password" ? "password reset" : "verification"} code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
  });

  return { delivered: true, devMode: false, messageId: info.messageId };
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

module.exports = { sendOtpEmail, generateOtp, isConfigured };
