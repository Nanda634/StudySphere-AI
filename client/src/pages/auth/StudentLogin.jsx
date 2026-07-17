import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-20">
      <h1 className="font-display text-3xl mb-1">Student sign in</h1>
      <p className="text-ink2 mb-8">Pick up your notes, flashcards, and quizzes where you left off.</p>

      <form onSubmit={handleSubmit} className="bg-panel rounded-2xl p-6 space-y-4">
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
        <div>
          <label className="text-sm text-ink2 block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
          />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-glow hover:underline">Forgot password?</Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-glow text-ink font-semibold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-ink2 text-sm mt-4 text-center">
        New here? <Link to="/student/register" className="text-glow hover:underline">Create a student account</Link>
      </p>
      <p className="text-ink2 text-sm mt-2 text-center">
        Faculty member? <Link to="/faculty/login" className="text-glow hover:underline">Sign in here</Link>
      </p>
    </div>
  );
}
