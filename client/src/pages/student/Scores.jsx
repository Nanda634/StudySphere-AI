import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function Scores() {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [codingAttempts, setCodingAttempts] = useState([]);
  const [tab, setTab] = useState("quiz");

  useEffect(() => {
    api.get("/ai/quiz/history").then((r) => setQuizAttempts(r.data));
    api.get("/courses/coding-history").then((r) => setCodingAttempts(r.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Your Scores</h1>
      <p className="text-ink2 mb-6">Every quiz and coding assessment you've taken — retake any topic to improve.</p>

      <div className="flex gap-1 mb-6 border-b border-white/5">
        <button
          onClick={() => setTab("quiz")}
          className={`px-4 py-2 text-sm rounded-t-lg border-b-2 ${tab === "quiz" ? "border-glow text-paper bg-panel" : "border-transparent text-ink2"}`}
        >
          Quizzes & Exams ({quizAttempts.length})
        </button>
        <button
          onClick={() => setTab("coding")}
          className={`px-4 py-2 text-sm rounded-t-lg border-b-2 ${tab === "coding" ? "border-glow text-paper bg-panel" : "border-transparent text-ink2"}`}
        >
          Coding Assessments ({codingAttempts.length})
        </button>
      </div>

      {tab === "quiz" && (
        <div className="space-y-2">
          {quizAttempts.length === 0 && <p className="text-ink2 bg-panel rounded-2xl p-6">No quizzes taken yet.</p>}
          {quizAttempts.map((a) => {
            const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
            return (
              <div key={a.id} className="bg-panel rounded-xl px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium">{a.topic}</span>
                    {a.examType && <span className="text-glow text-xs ml-2 font-mono">{a.examType}</span>}
                    <span className="text-ink2 text-xs ml-2">· {a.difficulty}</span>
                  </div>
                  <span className={`font-mono text-sm ${pct >= 60 ? "text-teal" : "text-coral"}`}>{a.score}/{a.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink2 text-xs">{new Date(a.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-3">
                    {a.coinsEarned > 0 && <span className="text-glow text-xs font-mono">+{a.coinsEarned} 🪙</span>}
                    <Link
                      to={`/student/assistant?mode=quiz&topic=${encodeURIComponent(a.topic)}`}
                      className="text-glow text-xs hover:underline"
                    >
                      Retake →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "coding" && (
        <div className="space-y-2">
          {codingAttempts.length === 0 && <p className="text-ink2 bg-panel rounded-2xl p-6">No coding assessments taken yet.</p>}
          {codingAttempts.map((a) => (
            <div key={a.id} className="bg-panel rounded-xl px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-medium">{a.topic}</span>
                  <span className="text-ink2 text-xs ml-2">· {a.language}</span>
                </div>
                <span className={`font-mono text-sm ${a.score >= 60 ? "text-teal" : "text-coral"}`}>{a.score}/100</span>
              </div>
              <p className="text-ink2 text-sm mb-1">{a.aiFeedback}</p>
              <div className="flex items-center justify-between">
                <span className="text-ink2 text-xs">{new Date(a.createdAt).toLocaleString()}</span>
                {a.coinsEarned > 0 && <span className="text-glow text-xs font-mono">+{a.coinsEarned} 🪙</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
