import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
      <p className="text-glow font-mono text-sm tracking-widest uppercase mb-6">
        One Platform. Infinite Learning.
      </p>
      <h1 className="font-display text-5xl md:text-6xl leading-tight mb-6">
        Your desk lamp is on.
        <br />
        <span className="italic text-glow">Your AI tutor is too.</span>
      </h1>
      <p className="text-ink2 text-lg max-w-2xl mx-auto mb-10">
        Meet <span className="text-glow">Goose</span> — your AI study assistant. Explanations, notes,
        flashcards, MCQs and quizzes, generated instantly for any subject, from school boards to UPSC.
        Upload a PDF and Goose turns it into a full study kit in seconds.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          to="/student/register"
          className="bg-glow text-ink font-semibold px-8 py-3 rounded-full shadow-lamp hover:brightness-110 transition"
        >
          Start studying free
        </Link>
        <Link to="/student/login" className="text-paper px-8 py-3 rounded-full border border-white/10 hover:bg-panel transition">
          Sign in
        </Link>
      </div>
    </section>
  );
}
