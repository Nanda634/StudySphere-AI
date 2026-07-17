import React, { useState } from "react";

export default function McqView({ questions = [] }) {
  const [revealed, setRevealed] = useState({});
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="bg-panel rounded-2xl p-5">
          <p className="font-medium mb-3">{i + 1}. {q.question}</p>
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            {Object.entries(q.options).map(([key, val]) => (
              <div
                key={key}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  revealed[i] && key === q.correctOption
                    ? "border-teal bg-teal/10 text-teal"
                    : "border-white/10 text-ink2"
                }`}
              >
                <span className="font-mono mr-2">{key}.</span>{val}
              </div>
            ))}
          </div>
          {!revealed[i] ? (
            <button onClick={() => setRevealed((r) => ({ ...r, [i]: true }))} className="text-glow text-sm hover:underline">
              Show answer
            </button>
          ) : (
            <p className="text-ink2 text-sm">{q.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}
