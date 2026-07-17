import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

// Shared forgot-password flow for both students and faculty (password reset is role-agnostic —
// it just looks the account up by email). Step 1: enter email, get a code. Step 2: enter the
// code plus a new password in one go.
export default function ForgotPassword() {
  const { sendPasswordResetOtp, resendPasswordResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (step === "reset") inputsRef.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await sendPasswordResetOtp(email);
      setInfo(data.devOtp ? `Dev mode (no SMTP configured): your code is ${data.devOtp}` : data.message);
      setStep("reset");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't send a reset code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateDigit(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[index] = clean;
      return next;
    });
    if (clean && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits((d) => {
      const next = [...d];
      for (let i = 0; i < text.length; i++) next[i] = text[i];
      return next;
    });
    inputsRef.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't reset your password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const data = await resendPasswordResetOtp(email);
      setInfo(data.devOtp ? `Dev mode (no SMTP configured): your new code is ${data.devOtp}` : "A new code has been sent.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-20">
      <h1 className="font-display text-3xl mb-1">Reset your password</h1>
      <p className="text-ink2 mb-8">
        {step === "email" && "Enter your account email and we'll send you a 6-digit reset code."}
        {step === "reset" && "Enter the code we sent, plus your new password."}
        {step === "done" && "All set."}
      </p>

      {step === "email" && (
        <form onSubmit={handleSendCode} className="bg-panel rounded-2xl p-6 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div>
            <label className="text-sm text-ink2 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Sending code..." : "Send reset code"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleReset} className="bg-panel rounded-2xl p-6 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          {info && <p className="text-teal text-sm">{info}</p>}

          <div>
            <label className="text-sm text-ink2 block mb-2">6-digit code sent to {email}</label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={d}
                  onChange={(e) => updateDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono bg-ink border border-white/10 rounded-lg focus:border-glow outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-ink2 block mb-1">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-ink2 block mb-1">Confirm new password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep("email")} className="text-ink2 hover:underline">
              ← Use a different email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-glow hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resending ? "Sending..." : cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="bg-panel rounded-2xl p-6 text-center space-y-4">
          <p className="text-teal">Your password has been reset.</p>
          <button
            onClick={() => navigate("/student/login")}
            className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition"
          >
            Go to sign in
          </button>
        </div>
      )}

      <p className="text-ink2 text-sm mt-4 text-center">
        Remembered it? <Link to="/student/login" className="text-glow hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
