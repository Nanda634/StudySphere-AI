const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { sendOtpEmail, generateOtp } = require("../utils/mailer");

const router = express.Router();
const prisma = new PrismaClient();

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
const MAX_OTP_ATTEMPTS = 5;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// STEP 1 of registration: validate details, generate a 6-digit OTP, email it, and stash the
// pending account (hashed password included) so verify-otp can create the User once confirmed.
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Clear out any older pending OTPs for this email/purpose before creating a fresh one.
    await prisma.emailOtp.deleteMany({ where: { email: normalizedEmail, purpose: "register" } });

    await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        purpose: "register",
        otpHash,
        payload: JSON.stringify({ name, hashedPassword, role: role === "FACULTY" ? "FACULTY" : "STUDENT" }),
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    await sendOtpEmail(normalizedEmail, otp, "register");

res.json({
  success: true,
  message: "Verification code sent successfully.",
  email: normalizedEmail,
  expiresInMinutes: OTP_EXPIRY_MINUTES,
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't send verification code. Try again." });
  }
});

// STEP 2 of registration: check the OTP, then actually create the User and log them in.
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "email and otp are required" });

    const normalizedEmail = email.trim().toLowerCase();
    const record = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail, purpose: "register" },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "No pending verification for this email. Please register again." });
    }
    if (record.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(400).json({ error: "That code expired. Please request a new one." });
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      await prisma.emailOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ error: "Incorrect code. Please try again." });
    }

    const alreadyExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (alreadyExists) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const { name, hashedPassword, role } = JSON.parse(record.payload);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword, role },
    });

    await prisma.emailOtp.deleteMany({ where: { email: normalizedEmail, purpose: "register" } });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't verify that code. Try again." });
  }
});

// Resends a fresh OTP for a pending registration (reuses the same stashed name/password/role).
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });
    const normalizedEmail = email.trim().toLowerCase();

    const record = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail, purpose: "register" },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      return res.status(400).json({ error: "No pending verification for this email. Please register again." });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { otpHash, attempts: 0, expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000) },
    });

    await sendOtpEmail(normalizedEmail, otp, "register");

res.json({
  success: true,
  message: "A new verification code has been sent.",
  expiresInMinutes: OTP_EXPIRY_MINUTES,
});

// STEP 1 of password reset: if an account exists for this email, send a reset code. Always
// returns the same generic message either way so this endpoint can't be used to check which
// emails are registered.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const genericResponse = { message: "If an account exists for that email, a reset code has been sent." };

    if (!user) {
      return res.json(genericResponse);
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await prisma.emailOtp.deleteMany({ where: { email: normalizedEmail, purpose: "reset-password" } });
    await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        purpose: "reset-password",
        otpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    await sendOtpEmail(normalizedEmail, otp, "reset-password");

res.json({
  success: true,
  ...genericResponse,
  expiresInMinutes: OTP_EXPIRY_MINUTES,
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't process that request. Try again." });
  }
});

// Resends a fresh reset-password code (only if a pending reset request already exists).
router.post("/forgot-password/resend", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });
    const normalizedEmail = email.trim().toLowerCase();

    const record = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail, purpose: "reset-password" },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      return res.status(400).json({ error: "No pending reset request for this email. Please start over." });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { otpHash, attempts: 0, expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000) },
    });

    await sendOtpEmail(normalizedEmail, otp, "register");

res.json({
  success: true,
  message: "A new verification code has been sent.",
  expiresInMinutes: OTP_EXPIRY_MINUTES,
});

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Couldn't resend the code. Try again.",
    });
  }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't resend the code. Try again." });
  }
});

// STEP 2 of password reset: verify the code and set the new password in one call.
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "email, otp, and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail, purpose: "reset-password" },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "No pending reset request for this email. Please start over." });
    }
    if (record.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(400).json({ error: "That code expired. Please request a new one." });
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      await prisma.emailOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ error: "Incorrect code. Please try again." });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      return res.status(404).json({ error: "No account found for this email." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    await prisma.emailOtp.deleteMany({ where: { email: normalizedEmail, purpose: "reset-password" } });

    res.json({ message: "Password reset. You can now sign in with your new password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't reset your password. Try again." });
  }
});

// Legacy direct registration endpoint, kept for reference/testing — the client now always
// goes through send-otp -> verify-otp so every account has a verified email.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        role: role === "FACULTY" ? "FACULTY" : "STUDENT",
      },
    });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email?.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
