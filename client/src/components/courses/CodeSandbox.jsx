import React, { useState } from "react";
import api from "../../services/api";

const LANGUAGES = ["javascript", "python", "java", "c", "cpp", "typescript", "go", "rust", "kotlin", "swift"];

// Runs JavaScript directly and safely in the browser (real execution). For every other
// language there's no sandboxed executor available here, so those get an AI code review
// from Goose instead of real run-and-grade — that's stated in the UI, not hidden.
export default function CodeSandbox({ topic, initialLanguage = "javascript", initialCode = "" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function runJavaScript() {
    setOutput(null);
    setError("");
    const logs = [];
    const fakeConsole = { log: (...args) => logs.push(args.map(String).join(" ")) };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", code);
      fn(fakeConsole);
      setOutput(logs.length ? logs.join("\n") : "(no output — try console.log(...) in your code)");
    } catch (err) {
      setOutput(null);
      setError(err.message);
    }
  }

  async function getAiReview() {
    setError("");
    setReview(null);
    setLoading(true);
    try {
      const { data } = await api.post("/courses/coding-review", { topic, language, code });
      setReview(data);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't review that code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-ink rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-panel border border-white/10 rounded-lg px-3 py-1 text-sm outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {language === "javascript" && (
            <button onClick={runJavaScript} className="text-teal text-sm hover:underline">▶ Run</button>
          )}
          <button onClick={getAiReview} disabled={loading || !code.trim()} className="text-glow text-sm hover:underline disabled:opacity-50">
            {loading ? "Goose is reviewing..." : "🪿 Ask Goose to review"}
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        spellCheck={false}
        placeholder={`Write your ${language} code here...`}
        className="w-full bg-panel border border-white/10 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-glow resize-y"
      />

      {output !== null && (
        <div className="mt-3 bg-panel rounded-lg p-3">
          <p className="text-xs text-teal font-mono mb-1">Output</p>
          <pre className="text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      )}
      {error && <p className="text-coral text-sm mt-2">{error}</p>}

      {review && (
        <div className="mt-3 bg-panel rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-mono text-sm ${review.verdict === "correct" ? "text-teal" : review.verdict === "incorrect" ? "text-coral" : "text-glow"}`}>
              {review.verdict} — {review.score}/100
            </span>
            {review.coinsEarned > 0 && <span className="text-glow text-sm font-mono">+{review.coinsEarned} 🪙</span>}
          </div>
          <p className="text-ink2 text-sm whitespace-pre-wrap">{review.feedback}</p>
          {review.correctedCode && (
            <details className="text-sm">
              <summary className="text-glow cursor-pointer">See Goose's suggested version</summary>
              <pre className="bg-ink rounded-lg p-3 mt-2 overflow-x-auto text-xs">{review.correctedCode}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
