import React from "react";

// Illustrative sample quotes for the demo/portfolio build — replace with real
// user feedback once the platform has actual users.
const QUOTES = [
  ["Aditi", "Engineering student", "I used to spend an hour making flashcards. Now it's under a minute, and I get more practice in."],
  ["Rahul", "UPSC aspirant", "The MCQ generator at 50 questions has basically replaced three separate question-bank sites for me."],
  ["Meera", "12th grade student", "Uploading my class PDF and getting instant revision notes before an exam was a game changer."],
];

export default function Testimonials() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="font-display text-3xl mb-8 text-center">What students are saying</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {QUOTES.map(([name, role, quote]) => (
          <div key={name} className="bg-panel rounded-2xl p-6">
            <p className="text-ink2 mb-4">&ldquo;{quote}&rdquo;</p>
            <p className="text-sm">
              <span className="text-glow font-medium">{name}</span>{" "}
              <span className="text-ink2">— {role}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
