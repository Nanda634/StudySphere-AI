import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import QuizView from "../../components/quiz/QuizView";
import ProctorGuard from "../../components/proctor/ProctorGuard";
import RealExamRunner from "../../components/exam/RealExamRunner";

export default function MockExams() {
  const [catalog, setCatalog] = useState({ balance: 0, freeExamAvailable: true, exams: [] });
  const [loadingKey, setLoadingKey] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null); // { exam, result, codingRound, wasFree }
  const [forceSubmitSignal, setForceSubmitSignal] = useState(0);

  function load() {
    api.get("/mockexams/catalog").then((r) => setCatalog(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function unlock(key) {
    setError("");
    setLoadingKey(key);
    try {
      const { data } = await api.post(`/mockexams/${key}/generate`, { count: 15 });
      setActive(data);
      setForceSubmitSignal(0);
      load(); // refresh balance / free-exam status
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't generate that mock exam.");
    } finally {
      setLoadingKey(null);
    }
  }

  if (active) {
    const isRealExam = Boolean(active.codingRound?.problems?.length);
    return (
      <ProctorGuard active={true} onForceSubmit={() => setForceSubmitSignal((s) => s + 1)}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button onClick={() => setActive(null)} className="text-glow text-sm hover:underline mb-4">
            ← Back to mock exams
          </button>

          {isRealExam ? (
            <RealExamRunner
              exam={active.exam}
              result={active.result}
              codingRound={active.codingRound}
              forceSubmitSignal={forceSubmitSignal}
              onExit={() => setActive(null)}
            />
          ) : (
            <>
              <h1 className="font-display text-3xl mb-1">{active.exam.name} — Practice Test</h1>
              {active.wasFree && <p className="text-teal text-sm mb-2">✓ Used your free mock exam — future ones cost coins.</p>}
              <p className="text-ink2 text-sm mb-6 bg-panel rounded-xl p-3">{active.result.disclaimer}</p>
              <QuizView questions={active.result.questions} topic={active.exam.name} difficulty="advanced" examType={active.exam.name} />
            </>
          )}
        </div>
      </ProctorGuard>
    );
  }

  const byCategory = catalog.exams.reduce((acc, e) => {
    (acc[e.category] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="font-display text-3xl">Real-World Mock Exams</h1>
        <span className="bg-panel px-4 py-1.5 rounded-full text-sm font-mono text-glow">🪙 {catalog.balance} coins</span>
      </div>
      <p className="text-ink2 mb-2">
        AI-generated practice tests in the style of real placement and entrance exams — not real
        official or leaked questions. IT placement exams (TCS, Accenture, Cognizant, Amazon,
        Google) run as a real two-round test: MCQs followed by a coding round, and every exam
        runs in fullscreen with camera/microphone monitoring, just like the real thing.
      </p>
      {catalog.freeExamAvailable ? (
        <p className="text-teal text-sm mb-6 bg-teal/10 rounded-xl px-4 py-2 inline-block">
          🎁 Your first mock exam is free — pick any one below to try it.
        </p>
      ) : (
        <p className="text-ink2 text-sm mb-6">Unlock more with coins earned from quizzes and coding assessments.</p>
      )}

      {error && <p className="text-coral text-sm mb-4">{error}</p>}

      {Object.entries(byCategory).map(([category, exams]) => (
        <div key={category} className="mb-8">
          <h2 className="font-display text-lg mb-3 text-glow">{category}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const affordable = catalog.freeExamAvailable || catalog.balance >= exam.cost;
              return (
                <div key={exam.key} className="bg-panel rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{exam.name}</h3>
                    <span className="font-mono text-sm text-glow">
                      {catalog.freeExamAvailable ? "FREE" : `🪙 ${exam.cost}`}
                    </span>
                  </div>
                  <p className="text-ink2 text-sm mb-2">{exam.blurb}</p>
                  {exam.hasCoding && (
                    <p className="text-ink2 text-xs mb-3">
                      📷 Proctored · MCQ + Coding round · ~{exam.durationMins || 60} min
                    </p>
                  )}
                  <button
                    onClick={() => unlock(exam.key)}
                    disabled={loadingKey === exam.key || !affordable}
                    className="bg-glow text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110 disabled:opacity-50"
                  >
                    {loadingKey === exam.key ? "Generating..." : !affordable ? "Not enough coins" : catalog.freeExamAvailable ? "Try free" : "Unlock & Start"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {loadingKey && <Loader label="Goose is building your practice test..." />}
    </div>
  );
}
