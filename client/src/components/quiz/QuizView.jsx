import React, { useState } from "react";
import api from "../../services/api";

export default function QuizView({ questions = [], topic, difficulty, examType, assignmentId, language }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      const { data } = await api.post("/ai/quiz/submit", {
        topic, difficulty, questions, answers, examType, assignmentId,
        language: language && language !== "en" ? language : undefined,
      });
      setSubmitted(data);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-display text-2xl">
            Score: <span className="text-glow">{submitted.score}/{submitted.total}</span>
          </h3>
          {submitted.coinsEarned > 0 && (
            <span className="bg-glow/20 text-glow text-sm font-mono px-3 py-1 rounded-full">
              +{submitted.coinsEarned} 🪙 coins
            </span>
          )}
        </div>

        {submitted.aiFeedback && (
          <div className="bg-ink rounded-xl p-4">
            <p className="text-xs text-glow font-mono mb-1">Goose's feedback</p>
            <p className="text-ink2 whitespace-pre-wrap">{submitted.aiFeedback}</p>
          </div>
        )}

        <div className="space-y-2">
          {submitted.details.map((d, i) => (
            <div key={i} className={`px-4 py-2 rounded-lg text-sm ${d.correct ? "bg-teal/10 text-teal" : "bg-coral/10 text-coral"}`}>
              {i + 1}. {d.question} — you chose {d.chosen || "nothing"}, correct is {d.correctOption}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="bg-panel rounded-2xl p-5">
          <p className="font-medium mb-3">{i + 1}. {q.question}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {Object.entries(q.options).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setAnswers((a) => ({ ...a, [i]: key }))}
                className={`px-4 py-2 rounded-lg border text-sm text-left ${
                  answers[i] === key ? "border-glow bg-glow/10 text-glow" : "border-white/10 text-ink2 hover:bg-ink"
                }`}
              >
                <span className="font-mono mr-2">{key}.</span>{val}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={submit}
        disabled={submitting || Object.keys(answers).length < questions.length}
        className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}
