import React, { useState } from "react";
import api from "../../services/api";

const LANGUAGES = ["javascript", "python", "java", "c", "cpp", "typescript", "go", "rust", "kotlin", "swift"];

// Recreates w3schools' "Try it Yourself" editor: a code box, a green "Run »" button, and an
// output panel underneath. JavaScript runs for real in the browser; every other language gets
// an AI code review from Goose instead of real execution (same policy as the rest of the app).
export default function W3TryIt({ topic, initialLanguage = "javascript", initialCode = "" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function runJavaScript() {
    setOutput(null);
    setReview(null);
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

  async function run() {
    if (language === "javascript") {
      runJavaScript();
      return;
    }
    setError("");
    setOutput(null);
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
    <div className="w3-tryit">
      <span className="w3-tryit-label">Try it Yourself »</span>
      <div className="w3-tryit-box">
        <div className="w3-tryit-toolbar">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button className="w3-runbtn" onClick={run} disabled={loading || !code.trim()}>
            {loading ? "Reviewing..." : "Run »"}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          placeholder={`Write your ${language} code here...`}
        />
        <div className="w3-tryit-result">
          <div className="w3-tryit-result-label">Result</div>
          {error && <div className="w3-tryit-output" style={{ color: "#f16a6a" }}>{error}</div>}
          {output !== null && !error && <div className="w3-tryit-output">{output}</div>}
          {!error && output === null && !review && language !== "javascript" && (
            <div className="w3-tryit-output" style={{ color: "#888" }}>
              {language} isn't run in-browser — click "Run »" to get Goose's AI code review instead.
            </div>
          )}
          {review && (
            <div className="w3-tryit-feedback">
              <p style={{ margin: 0, fontWeight: 600, color: review.verdict === "correct" ? "#04aa6d" : "#f16a6a" }}>
                {review.verdict} — {review.score}/100 {review.coinsEarned > 0 ? `(+${review.coinsEarned} coins)` : ""}
              </p>
              <p style={{ marginTop: 6, fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}>{review.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
