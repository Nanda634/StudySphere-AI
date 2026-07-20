import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import OtpStep from "../../components/auth/OtpStep";

export default function StudentRegister() {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { sendRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendRegistrationOtp(
  form.name,
  form.email,
  form.password,
  "STUDENT"
);

setStep("otp");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Couldn't send verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">

      <div className="absolute -top-44 -left-44 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row items-center justify-center px-6 py-10 gap-10">

        <section className="hidden lg:flex flex-1 flex-col justify-center">

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-300">
            <GraduationCap size={18}/>
            StudySphere AI
          </span>

          <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
            Join the Future
            <br />
            of Learning
          </h1>

          <p className="mt-6 max-w-xl text-slate-300 text-lg leading-8">
            Create your student account to access AI Notes,
            quizzes, flashcards, study planner,
            attendance tracking and much more.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">

            <Feature
              icon={<BookOpen size={22}/>}
              title="AI Notes"
              text="Generate summaries instantly."
            />

            <Feature
              icon={<Brain size={22}/>}
              title="AI Quiz"
              text="Practice with adaptive quizzes."
            />

            <Feature
              icon={<ShieldCheck size={22}/>}
              title="Secure"
              text="OTP email verification."
            />

            <Feature
              icon={<GraduationCap size={22}/>}
              title="Track Progress"
              text="Monitor your learning."
            />

          </div>

        </section>

        <section className="w-full max-w-md">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

            {step === "form" ? (
              <>
                <div className="text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
                    <GraduationCap size={34} className="text-cyan-400"/>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    Student Registration
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Create your account
                  </p>

                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >

                  <Input
                    icon={<User size={18}/>}
                    label="Full Name"
                    value={form.name}
                    onChange={(e)=>update("name",e.target.value)}
                    placeholder="John Doe"
                  />

                  <Input
                    icon={<Mail size={18}/>}
                    type="email"
                    label="Email"
                    value={form.email}
                    onChange={(e)=>update("email",e.target.value)}
                    placeholder="student@example.com"
                  />

                  <div>

                    <label className="mb-2 block text-sm text-slate-300">
                      Password
                    </label>

                    <div className="relative">

                      <input
                        required
                        minLength={6}
                        type={showPassword?"text":"password"}
                        value={form.password}
                        onChange={(e)=>update("password",e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-xl border border-white/10 bg-[#111c2f] px-4 py-3 pr-12 outline-none focus:border-cyan-400"
                      />

                      <button
                        type="button"
                        onClick={()=>setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                      </button>

                    </div>

                  </div>

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold hover:scale-[1.02] transition"
                  >
                    {loading
                      ? "Sending Verification..."
                      : "Send Verification Code"}
                  </button>

                </form>

                <p className="mt-8 text-center text-slate-400">
                  Already have an account?

                  <Link
                    to="/student/login"
                    className="ml-2 text-cyan-400 font-semibold hover:underline"
                  >
                    Sign In
                  </Link>

                </p>
              </>
            ) : (
              <OtpStep
  email={form.email}
  onBack={() => setStep("form")}
  onVerified={() => navigate("/student/dashboard")}
/>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function Input({
  icon,
  label,
  type="text",
  value,
  onChange,
  placeholder
}) {

  return (
    <div>

      <label className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <div className="relative">

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          required
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-[#111c2f] pl-12 pr-4 py-3 outline-none focus:border-cyan-400"
        />

      </div>

    </div>
  );
}

function Feature({icon,title,text}) {

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-cyan-400/40 transition">

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