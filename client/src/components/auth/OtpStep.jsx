import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

// Shown after the registration form is submitted. Verifies the 6-digit email OTP and, on
// success, completes account creation + login (handled inside verifyRegistrationOtp).
export default function OtpStep({ email, initialDevOtp, onVerified, onBack }) {
  const { verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState(initialDevOtp ? `Dev mode (no SMTP configured): your code is ${initialDevOtp}` : "");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function updateDigit(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[index] = clean;
      return next;
    });
    if (clean && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
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

  async function handleVerify(e) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      await verifyRegistrationOtp(email, code);
      onVerified();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't verify that code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const data = await resendRegistrationOtp(email);
      setInfo(data.devOtp ? `Dev mode (no SMTP configured): your new code is ${data.devOtp}` : "A new code has been sent to your email.");
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
    <form onSubmit={handleVerify} className="bg-panel rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="font-display text-xl mb-1">Verify your email</h2>
        <p className="text-ink2 text-sm">
          We sent a 6-digit code to <span className="text-paper font-medium">{email}</span>. Enter it below to finish
          creating your account.
        </p>
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}
      {info && <p className="text-teal text-sm">{info}</p>}

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

      <button
        type="submit"
        disabled={verifying}
        className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
      >
        {verifying ? "Verifying..." : "Verify & create account"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-ink2 hover:underline">
          ← Edit details
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
  );
}
