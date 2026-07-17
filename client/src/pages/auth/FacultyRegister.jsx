import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OtpStep from "../../components/auth/OtpStep";

export default function FacultyRegister() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await sendRegistrationOtp(form.name, form.email, form.password, "FACULTY");
      setDevOtp(data.devOtp || null);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't send a verification code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-20">
      <h1 className="font-display text-3xl mb-1">Create your faculty account</h1>
      <p className="text-ink2 mb-8">
        {step === "form" ? "Upload materials, build quizzes, and track your students. We'll email you a code to verify it's really you." : "One more step."}
      </p>

      {step === "form" ? (
        <form onSubmit={handleSubmit} className="bg-panel rounded-2xl p-6 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div>
            <label className="text-sm text-ink2 block mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-ink2 block mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-ink2 block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <OtpStep
          email={form.email}
          initialDevOtp={devOtp}
          onBack={() => setStep("form")}
          onVerified={() => navigate("/faculty/dashboard")}
        />
      )}

      <p className="text-ink2 text-sm mt-4 text-center">
        Already have an account? <Link to="/faculty/login" className="text-glow hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
