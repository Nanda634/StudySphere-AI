import React from "react";

const FEATURES = [
  ["Explain", "Any topic, broken down clearly with examples and real-world context."],
  ["Notes Generator", "Short, detailed, exam-ready, and revision notes — instantly."],
  ["Flashcards", "Auto-generated Q&A cards with memory tips, ready to flip through."],
  ["MCQ Generator", "10, 20, or 50 questions at your chosen difficulty."],
  ["AI Quiz", "Scored attempts with instant, question-by-question feedback."],
  ["AI Chatbot", "Ask anything — explanations, interview questions, doubts."],
  ["PDF Study Assistant", "Upload a document, generate notes and quizzes straight from it."],
  ["Planner & Pomodoro", "Plan your week, track focus time, and build your streak."],
];

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="font-display text-3xl mb-8 text-center">Everything your study session needs</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(([title, desc]) => (
          <div key={title} className="bg-panel rounded-2xl p-5">
            <h3 className="font-display text-lg mb-2">{title}</h3>
            <p className="text-ink2 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
