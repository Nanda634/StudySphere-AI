import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OtpStep({
  email,
  onVerified,
  onBack,
}) {
  const {
    verifyRegistrationOtp,
    resendRegistrationOtp,
  } = useAuth();

  const [digits, setDigits] = useState(
    Array(CODE_LENGTH).fill("")
  );

  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    "We've sent a verification code to your email."
  );

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] =
    useState(RESEND_COOLDOWN);

  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  function updateDigit(index, value) {
    const clean = value
      .replace(/\D/g, "")
      .slice(-1);

    setDigits((old) => {
      const next = [...old];
      next[index] = clean;
      return next;
    });

    if (clean && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (
      e.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!text) return;

    e.preventDefault();

    const next = Array(CODE_LENGTH).fill("");

    text.split("").forEach((char, i) => {
      next[i] = char;
    });

    setDigits(next);

    inputsRef.current[
      Math.min(text.length, CODE_LENGTH - 1)
    ]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();

    const otp = digits.join("");

    if (otp.length !== CODE_LENGTH) {
      return setError(
        "Please enter the complete 6-digit OTP."
      );
    }

    setError("");
    setVerifying(true);

    try {
      await verifyRegistrationOtp(email, otp);

      onVerified();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Invalid verification code."
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");

    setResending(true);

    try {
      await resendRegistrationOtp(email);

      setDigits(Array(CODE_LENGTH).fill(""));

      setInfo(
        "A new verification code has been sent to your email."
      );

      inputsRef.current[0]?.focus();

      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't resend verification code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      onSubmit={handleVerify}
      className="bg-panel rounded-2xl p-6 space-y-4"
    >
      <div>
        <h2 className="font-display text-xl mb-1">
          Verify your email
        </h2>

        <p className="text-ink2 text-sm">
          Enter the 6-digit verification code sent to
          <span className="text-paper font-medium">
            {" "}
            {email}
          </span>
        </p>
      </div>

      {error && (
        <p className="text-coral text-sm">
          {error}
        </p>
      )}

      {info && (
        <p className="text-teal text-sm">
          {info}
        </p>
      )}

      <div
        className="flex justify-between gap-2"
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) =>
              (inputsRef.current[index] = el)
            }
            value={digit}
            onChange={(e) =>
              updateDigit(index, e.target.value)
            }
            onKeyDown={(e) =>
              handleKeyDown(index, e)
            }
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
        {verifying
          ? "Verifying..."
          : "Verify & Create Account"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-ink2 hover:underline"
        >
          ← Edit Details
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={
            resending || cooldown > 0
          }
          className="text-glow hover:underline disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend (${cooldown}s)`
            : "Resend Code"}
        </button>
      </div>
    </form>
  );
}