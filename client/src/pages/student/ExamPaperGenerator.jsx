import React, { useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function ExamPaperGenerator() {
  const [topic, setTopic] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [totalMarks, setTotalMarks] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paper, setPaper] = useState(null);

  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const { data } = await api.post("/pdf/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfText(data.text);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't read that PDF. Try pasting the text instead, below.");
      setShowPaste(true);
      setPdfName("");
    } finally {
      setLoading(false);
    }
  }

  const scheme = totalMarks == 50
    ? "2 mark, 4 mark, and 8 mark questions"
    : "2 mark, 4 mark, 8 mark, and 16 mark questions";

  async function generate() {
    setError("");
    setPaper(null);
    const sourceText = pastedText.trim() || pdfText;
    if (!topic && !sourceText) {
      setError("Enter a topic/unit name, upload a PDF, or paste text first.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate", {
        mode: "exam_paper",
        topic: sourceText ? undefined : topic,
        text: sourceText || undefined,
        totalMarks: Number(totalMarks),
        marksScheme: scheme,
      });
      setPaper(data.result);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't generate that paper. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Exam Paper Generator</h1>
      <p className="text-ink2 mb-6">
        Give Goose a unit/topic (or upload a PDF), and it drafts a full written question paper
        with a marks-weighted structure — great for self-testing before a real exam.
      </p>

      <div className="bg-panel rounded-2xl p-6 mb-6 space-y-4">
        <div>
          <label className="text-sm text-ink2 block mb-1">Topic / unit name</label>
          <input
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setPdfText("");
              setPdfName("");
            }}
            placeholder="e.g. Unit 3 — Database Normalization"
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-sm text-ink2">
          <span>or</span>
          <label className="cursor-pointer text-glow hover:underline">
            Upload a unit PDF
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
          </label>
          {pdfName && <span className="text-teal">✓ {pdfName}</span>}
          <span>or</span>
          <button type="button" onClick={() => setShowPaste((s) => !s)} className="text-glow hover:underline">
            {showPaste ? "Hide paste box" : "Paste text instead"}
          </button>
        </div>

        {showPaste && (
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            placeholder="Paste your unit content here — works even if PDF upload fails."
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
        )}

        <div>
          <label className="text-sm text-ink2 block mb-1">Total marks</label>
          <select
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
          >
            <option value={50}>50 marks (2 / 4 / 8 mark questions)</option>
            <option value={100}>100 marks (2 / 4 / 8 / 16 mark questions)</option>
          </select>
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Goose is drafting..." : "Generate Paper"}
        </button>
      </div>

      {loading && <Loader label="Goose is drafting your question paper..." />}

      {paper && (
        <div className="bg-panel rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-xl text-glow">Question Paper — {paper.totalMarks} Marks</h2>
          {paper.sections.map((section, si) => (
            <div key={si}>
              <h3 className="font-medium mb-1">
                Section {si + 1} — {section.marksPerQuestion} marks each
              </h3>
              <p className="text-ink2 text-sm italic mb-2">{section.instructions}</p>
              <ol className="list-decimal list-inside space-y-1 text-ink2">
                {section.questions.map((q, qi) => (
                  <li key={qi}>{q}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
