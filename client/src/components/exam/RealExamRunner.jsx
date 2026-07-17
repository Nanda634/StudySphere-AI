import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Loader from "../common/Loader";

function useCountdown(totalSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return undefined;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  return { secondsLeft, label: `${mins}:${secs}` };
}

// Renders a real placement-exam-style test: Section 1 is an MCQ round with a question palette
// (numbered grid, answered/unanswered/marked coloring) shown one question at a time, exactly
// like TCS NQT / Accenture's actual test UI. Section 2 (if the exam has one) is a coding round
// with a problem list and code editor, graded by Goose's AI review. Meant to be rendered inside
// <ProctorGuard> so the whole thing is fullscreen + camera/mic monitored.
export default function RealExamRunner({ exam, result, codingRound, onExit, forceSubmitSignal }) {
  const questions = result.questions || [];
  const hasCoding = Boolean(codingRound?.problems?.length);

  const [section, setSection] = useState("mcq"); // "mcq" | "coding" | "results"
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [mcqResult, setMcqResult] = useState(null);
  const [submittingMcq, setSubmittingMcq] = useState(false);

  const [codingIndex, setCodingIndex] = useState(0);
  const [codingAnswers, setCodingAnswers] = useState({}); // { [idx]: code }
  const [codingResults, setCodingResults] = useState({}); // { [idx]: reviewResponse }
  const [gradingCoding, setGradingCoding] = useState(false);

  const durationMins = exam.durationMins || 60;
  const mcqSeconds = hasCoding ? Math.floor((durationMins * 60) / 2) : durationMins * 60;
  const codingSeconds = hasCoding ? Math.ceil((durationMins * 60) / 2) : 0;

  const mcqCountdown = useCountdown(section === "mcq" ? mcqSeconds : 0, () => {
    if (section === "mcq") submitMcq();
  });
  const codingCountdown = useCountdown(section === "coding" ? codingSeconds : 0, () => {
    if (section === "coding") submitCoding();
  });

  // ProctorGuard tells us to force-submit (too many violations) via this incrementing signal.
  useEffect(() => {
    if (forceSubmitSignal > 0) {
      if (section === "mcq") submitMcq();
      else if (section === "coding") submitCoding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSubmitSignal]);

  async function submitMcq() {
    if (submittingMcq || mcqResult) return;
    setSubmittingMcq(true);
    try {
      const { data } = await api.post("/ai/quiz/submit", {
        topic: exam.name,
        difficulty: "advanced",
        questions,
        answers,
        examType: exam.name,
      });
      setMcqResult(data);
    } finally {
      setSubmittingMcq(false);
      if (hasCoding) {
        setSection("coding");
      } else {
        setSection("results");
      }
    }
  }

  async function submitCoding() {
    if (gradingCoding) return;
    setGradingCoding(true);
    const results = {};
    for (let i = 0; i < codingRound.problems.length; i++) {
      const code = codingAnswers[i];
      if (!code || !code.trim()) {
        results[i] = { score: 0, verdict: "incorrect", feedback: "No code was submitted for this problem." };
        continue;
      }
      try {
        const { data } = await api.post("/courses/coding-review", {
          topic: `${exam.name} — ${codingRound.problems[i].title}`,
          language: codingRound.language,
          code,
        });
        results[i] = data;
      } catch (err) {
        results[i] = { score: 0, verdict: "incorrect", feedback: "Couldn't grade this submission." };
      }
    }
    setCodingResults(results);
    setGradingCoding(false);
    setSection("results");
  }

  const answeredCount = Object.keys(answers).length;

  const paletteStatus = useMemo(() => {
    return questions.map((_, i) => {
      if (i === current) return "current";
      if (marked[i]) return "marked";
      if (answers[i] !== undefined) return "answered";
      return "unanswered";
    });
  }, [questions, current, marked, answers]);

  if (section === "results") {
    const codingScores = Object.values(codingResults);
    const codingAvg = codingScores.length
      ? Math.round(codingScores.reduce((s, r) => s + (r.score || 0), 0) / codingScores.length)
      : null;
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl mb-1">{exam.name} — Results</h2>
        <p className="text-ink2 text-sm mb-6">{result.disclaimer}</p>

        <div className="bg-panel rounded-2xl p-6 mb-5">
          <h3 className="font-medium mb-2">Section 1 — Aptitude / MCQ</h3>
          <p className="text-glow text-2xl font-display">{mcqResult?.score ?? 0} / {questions.length}</p>
          {mcqResult?.aiFeedback && <p className="text-ink2 text-sm mt-3 whitespace-pre-wrap">{mcqResult.aiFeedback}</p>}
        </div>

        {hasCoding && (
          <div className="bg-panel rounded-2xl p-6 mb-5">
            <h3 className="font-medium mb-2">Section 2 — Coding Round ({codingRound.language})</h3>
            {codingAvg !== null && <p className="text-glow text-2xl font-display mb-3">Avg score: {codingAvg}/100</p>}
            <div className="space-y-3">
              {codingRound.problems.map((p, i) => (
                <div key={i} className="bg-ink rounded-xl p-4">
                  <p className="font-medium text-sm mb-1">{i + 1}. {p.title}</p>
                  <p className={`text-sm font-mono mb-1 ${codingResults[i]?.verdict === "correct" ? "text-teal" : "text-coral"}`}>
                    {codingResults[i]?.verdict} — {codingResults[i]?.score ?? 0}/100
                  </p>
                  <p className="text-ink2 text-sm whitespace-pre-wrap">{codingResults[i]?.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onExit} className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110">
          Back to mock exams
        </button>
      </div>
    );
  }

  if (section === "mcq") {
    const q = questions[current];
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="font-display text-xl">{exam.name} — Section 1: Aptitude / MCQ</h2>
          <span className="font-mono text-lg bg-panel px-4 py-1.5 rounded-full text-glow">⏱ {mcqCountdown.label}</span>
        </div>

        <div className="grid md:grid-cols-[1fr_220px] gap-5">
          <div className="bg-panel rounded-2xl p-6">
            <p className="text-ink2 text-sm mb-2">Question {current + 1} of {questions.length}</p>
            <p className="font-medium mb-4">{q.question}</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-6">
              {Object.entries(q.options).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setAnswers((a) => ({ ...a, [current]: key }))}
                  className={`px-4 py-2 rounded-lg border text-sm text-left ${
                    answers[current] === key ? "border-glow bg-glow/10 text-glow" : "border-white/10 text-ink2 hover:bg-ink"
                  }`}
                >
                  <span className="font-mono mr-2">{key}.</span>{val}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                  className="px-4 py-2 rounded-lg text-sm border border-white/10 text-ink2 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  disabled={current === questions.length - 1}
                  onClick={() => setCurrent((c) => c + 1)}
                  className="px-4 py-2 rounded-lg text-sm border border-white/10 text-ink2 disabled:opacity-40"
                >
                  Next →
                </button>
                <button
                  onClick={() => setMarked((m) => ({ ...m, [current]: !m[current] }))}
                  className="px-4 py-2 rounded-lg text-sm border border-white/10 text-ink2"
                >
                  {marked[current] ? "Unmark" : "Mark for review"}
                </button>
              </div>
              <button
                onClick={submitMcq}
                disabled={submittingMcq}
                className="bg-glow text-ink font-semibold px-5 py-2 rounded-lg hover:brightness-110 disabled:opacity-50"
              >
                {submittingMcq ? "Submitting..." : hasCoding ? "Submit & continue to Coding →" : "Submit Section"}
              </button>
            </div>
          </div>

          <div className="bg-panel rounded-2xl p-4 h-fit">
            <p className="text-xs text-ink2 mb-2">{answeredCount}/{questions.length} answered</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-8 rounded text-xs font-mono ${
                    paletteStatus[i] === "current"
                      ? "bg-glow text-ink"
                      : paletteStatus[i] === "marked"
                      ? "bg-coral/30 text-coral"
                      : paletteStatus[i] === "answered"
                      ? "bg-teal/20 text-teal"
                      : "bg-ink text-ink2"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // section === "coding"
  const problem = codingRound.problems[codingIndex];
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="font-display text-xl">{exam.name} — Section 2: Coding Round</h2>
        <span className="font-mono text-lg bg-panel px-4 py-1.5 rounded-full text-glow">⏱ {codingCountdown.label}</span>
      </div>

      <div className="flex gap-2 mb-4">
        {codingRound.problems.map((p, i) => (
          <button
            key={i}
            onClick={() => setCodingIndex(i)}
            className={`px-4 py-2 rounded-lg text-sm border ${
              codingIndex === i ? "border-glow bg-glow/10 text-glow" : "border-white/10 text-ink2"
            } ${codingAnswers[i]?.trim() ? "ring-1 ring-teal/40" : ""}`}
          >
            Problem {i + 1}
          </button>
        ))}
      </div>

      {gradingCoding ? (
        <Loader label="Goose is grading your submissions..." />
      ) : (
        <div className="bg-panel rounded-2xl p-6">
          <h3 className="font-medium mb-1">{problem.title}</h3>
          <p className="text-ink2 text-sm mb-3 whitespace-pre-wrap">{problem.statement}</p>
          {problem.sampleInput && (
            <div className="text-xs text-ink2 mb-3 font-mono bg-ink rounded-lg p-2">
              Input: {problem.sampleInput} → Output: {problem.sampleOutput}
            </div>
          )}
          <textarea
            value={codingAnswers[codingIndex] ?? problem.starterCode ?? ""}
            onChange={(e) => setCodingAnswers((a) => ({ ...a, [codingIndex]: e.target.value }))}
            rows={14}
            spellCheck={false}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-glow resize-y"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-ink2 text-sm">Language: {codingRound.language}</span>
            <button
              onClick={submitCoding}
              className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110"
            >
              Submit exam & get results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
