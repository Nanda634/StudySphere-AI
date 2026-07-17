import React from "react";

const SUBJECTS = [
  "Engineering", "Medical", "Law", "Management", "School (10th & 12th)",
  "UPSC", "SSC", "Banking", "GATE", "GRE", "CAT", "Programming", "General Knowledge",
];

export default function Subjects() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 text-center">
      <h2 className="font-display text-3xl mb-8">Built for every kind of learner</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {SUBJECTS.map((s) => (
          <span key={s} className="bg-panel text-ink2 text-sm px-4 py-2 rounded-full border border-white/5">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
