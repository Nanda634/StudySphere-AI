import React, { useState } from "react";
import api from "../../services/api";
import Loader from "../common/Loader";
import CodeSandbox from "./CodeSandbox";

export default function CodingAssessment({ topic, language }) {
  const [problems, setProblems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/courses/coding-problems", { topic, language, difficulty: "intermediate", count: 3 });
      setProblems(data.result.problems);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't generate coding problems.");
    } finally {
      setLoading(false);
    }
  }

  if (!problems) {
    return (
      <div className="bg-panel rounded-2xl p-6">
        <h3 className="font-display text-lg mb-2">Coding Assessment</h3>
        <p className="text-ink2 text-sm mb-4">
          Goose will generate 3 {language} problems on {topic}. Solutions are reviewed by AI
          (read and judged, not executed) — see the project README for why.
        </p>
        {error && <p className="text-coral text-sm mb-3">{error}</p>}
        <button
          onClick={generate}
          disabled={loading}
          className="bg-glow text-ink font-semibold px-5 py-2 rounded-lg hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Coding Assessment"}
        </button>
        {loading && <Loader label="Goose is writing problems..." />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {problems.map((p, i) => (
        <div key={i} className="bg-panel rounded-2xl p-6">
          <h3 className="font-display text-lg mb-1">{i + 1}. {p.title}</h3>
          <p className="text-ink2 text-sm mb-3 whitespace-pre-wrap">{p.statement}</p>
          {p.sampleInput && (
            <div className="text-xs text-ink2 mb-3 font-mono bg-ink rounded-lg p-2">
              Input: {p.sampleInput} → Output: {p.sampleOutput}
            </div>
          )}
          <CodeSandbox topic={`${topic} — ${p.title}`} initialLanguage={language} initialCode={p.starterCode || ""} />
        </div>
      ))}
    </div>
  );
}
