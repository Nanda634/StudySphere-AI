import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Brain,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function ForgotPassword() {
  const {
    sendPasswordResetOtp,
    resendPasswordResetOtp,
    resetPassword,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");

  const [digits, setDigits] = useState(
    Array(CODE_LENGTH).fill("")
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] =
    useState(false);

  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const inputsRef = useRef([]);

  useEffect(() => {
    if (step === "reset") {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSendCode(e) {
    e.preventDefault();

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const data =
  await sendPasswordResetOtp(email);

setInfo(
  data.message ||
  "If an account exists for that email, a verification code has been sent."
);

setStep("reset");
setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Couldn't send verification code."
      );
    } finally {
      setLoading(false);
    }
  }

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

    setDigits((old) => {
      const next = [...old];

      for (let i = 0; i < text.length; i++) {
        next[i] = text[i];
      }

      return next;
    });

    inputsRef.current[
      Math.min(text.length, CODE_LENGTH - 1)
    ]?.focus();
  }

  async function handleReset(e) {
    e.preventDefault();

    setError("");

    const otp = digits.join("");

    if (otp.length !== CODE_LENGTH) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(
        email,
        otp,
        newPassword
      );

      setStep("done");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Couldn't reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");

    setResending(true);

    try {
      const data =
  await resendPasswordResetOtp(email);

setInfo(
  data.message ||
  "A new verification code has been sent to your email."
);

setDigits(
  Array(CODE_LENGTH).fill("")
);

inputsRef.current[0]?.focus();

setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Couldn't resend OTP."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">

      <div className="absolute -top-44 -left-44 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row items-center justify-center px-6 py-10 gap-10">

        {/* LEFT PANEL */}

        <section className="hidden lg:flex flex-1 flex-col justify-center">

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-300">
            <GraduationCap size={18} />
            StudySphere AI
          </span>

          <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
            Recover
            <br />
            Your Account
          </h1>

          <p className="mt-6 max-w-xl text-slate-300 text-lg leading-8">
            Secure password recovery with
            email verification and OTP.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">

            <Feature
              icon={<ShieldCheck size={22} />}
              title="Secure"
              text="OTP Verification"
            />

            <Feature
              icon={<KeyRound size={22} />}
              title="Reset"
              text="Create New Password"
            />

            <Feature
              icon={<Brain size={22} />}
              title="AI Platform"
              text="Resume Learning"
            />

            <Feature
              icon={<BookOpen size={22} />}
              title="Continue"
              text="Access Dashboard"
            />

          </div>

        </section>

        {/* RIGHT CARD */}

        <section className="w-full max-w-md">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                      {step === "email" && (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
                    <Mail size={34} className="text-cyan-400" />
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    Forgot Password
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Enter your registered email to receive a verification code.
                  </p>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSendCode}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="example@email.com"
                        className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-4 py-3 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold transition hover:scale-[1.02]"
                  >
                    {loading
                      ? "Sending..."
                      : "Send Verification Code"}
                  </button>

                  <p className="text-center text-slate-400">
                    Remember your password?

                    <Link
                      to="/student/login"
                      className="ml-2 text-cyan-400 hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
                    <ShieldCheck
                      size={34}
                      className="text-cyan-400"
                    />
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    Verify OTP
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Enter the 6-digit verification code.
                  </p>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-300">
                    {info}
                  </div>
                )}

                <form
                  onSubmit={handleReset}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label className="mb-3 block text-sm text-slate-300">
                      Verification Code
                    </label>

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
                            updateDigit(
                              index,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(index, e)
                          }
                          inputMode="numeric"
                          maxLength={1}
                          className="h-14 w-12 rounded-xl border border-white/10 bg-[#111c2f] text-center text-xl font-bold outline-none focus:border-cyan-400"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      New Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-12 py-3 outline-none focus:border-cyan-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-12 py-3 outline-none focus:border-cyan-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold transition hover:scale-[1.02]"
                  >
                    {loading
                      ? "Resetting..."
                      : "Reset Password"}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setStep("email")
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      ← Change Email
                    </button>

                    <button
                      type="button"
                      disabled={
                        resending || cooldown > 0
                      }
                      onClick={handleResend}
                      className="text-cyan-400 hover:underline disabled:opacity-50"
                    >
                      {cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : "Resend OTP"}
                    </button>
                  </div>
                </form>
              </>
            )}
                        {step === "done" && (
              <>
                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                    <ShieldCheck
                      size={40}
                      className="text-green-400"
                    />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold">
                    Password Reset Successful
                  </h2>

                  <p className="mt-3 text-slate-400 leading-7">
                    Your password has been updated successfully.
                    You can now sign in using your new password.
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/student/login")
                  }
                  className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold transition hover:scale-[1.02]"
                >
                  Go To Login
                </button>

                <button
                  onClick={() =>
                    navigate("/")
                  }
                  className="mt-4 w-full rounded-xl border border-white/10 py-3 hover:bg-white/5 transition"
                >
                  Back to Home
                </button>

              </>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">

      <div className="mb-3 text-cyan-400">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        {text}
      </p>

    </div>
  );
}
