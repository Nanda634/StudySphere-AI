import React from "react";

const STEPS = [
  ["Type a topic or upload a PDF", "Give StudySphere something to work with — a subject name, or your own document."],
  ["Pick what you need", "Explanation, notes, flashcards, MCQs, or a full quiz — generated in seconds."],
  ["Practice and track", "Attempt quizzes, get scored instantly, and watch your dashboard fill in."],
];

export default function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="font-display text-3xl mb-8 text-center">How it works</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map(([title, desc], i) => (
          <div key={title} className="bg-panel rounded-2xl p-6 relative">
            <span className="font-mono text-glow/60 text-sm">Step {i + 1}</span>
            <h3 className="font-display text-xl mt-2 mb-2">{title}</h3>
            <p className="text-ink2 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
