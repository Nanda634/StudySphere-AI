import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Brain,
  ShieldCheck,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function FacultyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/faculty/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Couldn't sign in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      {/* Background Blur */}
      <div className="absolute -top-44 -left-44 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row items-center justify-center px-6 py-10 gap-10">

        {/* Left Side */}
        <section className="hidden lg:flex flex-1 flex-col justify-center">

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-300">
            <GraduationCap size={18}/>
            StudySphere AI
          </span>

          <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
            Welcome
            <br />
            Faculty
          </h1>

          <p className="mt-6 max-w-xl text-slate-300 text-lg leading-8">
            Manage subjects, upload study materials,
            create quizzes, monitor students and use
            AI-powered teaching tools from one dashboard.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">

            <Feature
              icon={<BookOpen size={22}/>}
              title="Course Materials"
              text="Upload PDFs, PPTs & Notes."
            />

            <Feature
              icon={<Brain size={22}/>}
              title="AI Quiz Builder"
              text="Generate quizzes instantly."
            />

            <Feature
              icon={<ShieldCheck size={22}/>}
              title="Secure Login"
              text="Protected authentication."
            />

            <Feature
              icon={<GraduationCap size={22}/>}
              title="Student Analytics"
              text="Track class performance."
            />

          </div>

        </section>

        {/* Login Card */}
        <section className="w-full max-w-md">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
                <GraduationCap
                  size={34}
                  className="text-cyan-400"
                />
              </div>

              <h2 className="mt-5 text-3xl font-bold">
                Faculty Login
              </h2>

              <p className="mt-2 text-slate-400">
                Welcome back! Sign in to continue.
              </p>

            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}

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
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder="faculty@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-4 py-3 outline-none transition focus:border-cyan-400"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-12 py-3 outline-none transition focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? <EyeOff size={20}/>
                      : <Eye size={20}/>
                    }
                  </button>

                </div>

                <div className="mt-2 text-right">

                  <Link
                    to="/forgot-password"
                    className="text-sm text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold transition hover:scale-[1.02] disabled:opacity-60"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"
                }
              </button>

            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10"/>
              <span className="text-sm text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-white/10"/>
            </div>

            <button className="w-full rounded-xl border border-white/10 py-3 hover:bg-white/5 transition">
              Continue with Google
            </button>

            <p className="mt-8 text-center text-slate-400">
              New Faculty?

              <Link
                to="/faculty/register"
                className="ml-2 font-semibold text-cyan-400 hover:underline"
              >
                Register
              </Link>

            </p>

            <p className="mt-3 text-center text-slate-400">
              Student?

              <Link
                to="/student/login"
                className="ml-2 font-semibold text-cyan-400 hover:underline"
              >
                Login Here
              </Link>

            </p>

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