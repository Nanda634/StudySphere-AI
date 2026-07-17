import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { ExplainView, NotesView } from "../../components/ai/ExplainAndNotesViews";
import McqView from "../../components/ai/McqView";
import FlashcardsView from "../../components/flashcards/FlashcardsView";
import QuizView from "../../components/quiz/QuizView";

const MODES = [
  { id: "explain", label: "Explain" },
  { id: "notes", label: "Notes" },
  { id: "flashcards", label: "Flashcards" },
  { id: "mcq", label: "MCQ" },
  { id: "quiz", label: "Quiz" },
  { id: "chat", label: "Chat with Goose" },
];

const LANGUAGES = [
  { code: "en", label: "English", speech: "en-US" },
  { code: "Hindi", label: "Hindi", speech: "hi-IN" },
  { code: "Tamil", label: "Tamil", speech: "ta-IN" },
  { code: "Telugu", label: "Telugu", speech: "te-IN" },
  { code: "Kannada", label: "Kannada", speech: "kn-IN" },
  { code: "Spanish", label: "Spanish", speech: "es-ES" },
  { code: "French", label: "French", speech: "fr-FR" },
];

export default function AIAssistant() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "explain");
  const [topic, setTopic] = useState(params.get("topic") || "");
  const [examTarget, setExamTarget] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

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

  async function generate() {
    setError("");
    setResult(null);
    const sourceText = pastedText.trim() || pdfText;
    if (!topic && !sourceText) {
      setError("Enter a topic, upload a PDF, or paste text first.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate", {
        mode,
        topic: sourceText ? undefined : topic,
        text: sourceText || undefined,
        difficulty,
        count: Number(count),
        examTarget: examTarget || undefined,
        language: language !== "en" ? language : undefined,
      });
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't generate that. Check that GEMINI_API_KEY is set in server/.env.");
    } finally {
      setLoading(false);
    }
  }

  return (
   <div
    className={
      mode === "chat"
        ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
        : "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
  }
>
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 mb-6 border-b border-white/10 scrollbar-hide">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl">🪿 Goose — your AI Study Assistant</h1>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-panel border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-glow"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
      <p className="text-ink2 mb-6">Type a topic, or upload a PDF, and Goose will generate what you need.</p>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-white/5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setResult(null);
              setError("");
            }}
            className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
              mode === m.id ? "border-glow text-paper bg-panel" : "border-transparent text-ink2 hover:text-paper"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode !== "chat" ? (
        <>
          <div className="bg-panel rounded-2xl p-6 mb-6 space-y-4">
            <div>
              <label className="text-sm text-ink2 block mb-1">Topic</label>
              <input
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setPdfText("");
                  setPdfName("");
                }}
                placeholder="e.g. Operating System Scheduling"
                className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-ink2 block mb-1">Exam / context target (optional)</label>
              <input
                value={examTarget}
                onChange={(e) => setExamTarget(e.target.value)}
                placeholder="e.g. GATE, UPSC, 12th board exam"
                className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-ink2">
              <span>or</span>
              <label className="cursor-pointer text-glow hover:underline">
                Upload a PDF
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
                placeholder="Paste your content here — works even if PDF upload fails."
                className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
              />
            )}

            {(mode === "mcq" || mode === "quiz") && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-ink2 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-ink2 block mb-1">Number of questions</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}

            {mode === "flashcards" && (
              <div>
                <label className="text-sm text-ink2 block mb-1">Number of flashcards</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            )}

            {error && <p className="text-coral text-sm">{error}</p>}

            <button
              onClick={generate}
              disabled={loading}
              className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Goose is working..." : "Generate"}
            </button>
          </div>

          {loading && <Loader label="Goose is thinking..." />}
          {result && mode === "explain" && <ExplainView result={result} />}
          {result && mode === "notes" && <NotesView result={result} />}
          {result && mode === "flashcards" && <FlashcardsView cards={result.flashcards} />}
          {result && mode === "mcq" && <McqView questions={result.questions} />}
          {result && mode === "quiz" && (
            <QuizView questions={result.questions} topic={topic || pdfName} difficulty={difficulty} language={language} />
          )}
        </>
      ) : (
        <ChatWithHistory speechLang={LANGUAGES.find((l) => l.code === language)?.speech || "en-US"} language={language} />
      )}
    </div>
  );
}

function ChatWithHistory({ speechLang, language }) {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const recognitionRef = useRef(null);
  const supportsSpeech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supportsSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  function loadSessions() {
    api.get("/chat/sessions").then((r) => setSessions(r.data));
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function newChat() {
    const { data } = await api.post("/chat/sessions", {});
    setActiveId(data.id);
    setChatLog([]);
    loadSessions();
  }

  async function openSession(id) {
    setActiveId(id);
    const { data } = await api.get(`/chat/sessions/${id}`);
    setChatLog(data.messages.map((m) => ({ role: m.role, text: m.content })));
  }

  async function deleteSession(id, e) {
    e.stopPropagation();
    await api.delete(`/chat/sessions/${id}`);
    if (activeId === id) {
      setActiveId(null);
      setChatLog([]);
    }
    loadSessions();
  }

  function speak(text) {
    if (!voiceReplies || !supportsSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    window.speechSynthesis.speak(utterance);
  }

  async function sendChat(text) {
    if (!text.trim()) return;
    let sessionId = activeId;
    if (!sessionId) {
      const { data } = await api.post("/chat/sessions", {});
      sessionId = data.id;
      setActiveId(sessionId);
    }
    setChatLog((log) => [...log, { role: "user", text }]);
    setChatInput("");
    setLoading(true);
    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, {
        text, language: language !== "en" ? language : undefined,
      });
      setChatLog((log) => [...log, { role: "ai", text: data.reply }]);
      loadSessions();
      return data.reply;
    } catch (err) {
      const errMsg = "Sorry, Goose ran into a problem reaching the AI. Try again in a moment.";
      setChatLog((log) => [...log, { role: "ai", text: errMsg }]);
      return errMsg;
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setChatLog((log) => [...log, { role: "user", text: "[Uploaded an image]", image: previewUrl }]);
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("question", "Describe this image and explain anything academically relevant in it.");
    try {
      const { data } = await api.post("/vision/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setChatLog((log) => [...log, { role: "ai", text: data.reply }]);
      speak(data.reply);
    } catch (err) {
      setChatLog((log) => [
        ...log,
        { role: "ai", text: err.response?.data?.error || "Goose couldn't analyze that image. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    if (!supportsSpeech) return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      const reply = await sendChat(transcript);
      if (reply) speak(reply);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
  <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">

    {/* Sidebar */}
    {sidebarOpen && (
      <aside
        className="
          w-full
          lg:w-72
          bg-panel
          rounded-2xl
          p-4
          flex
          flex-col
          shrink-0
          max-h-[300px]
          lg:max-h-full
        "
      >
        <button
          onClick={newChat}
          className="bg-glow text-ink font-semibold rounded-xl py-3 mb-4 hover:brightness-110"
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`group flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer transition ${
                activeId === s.id
                  ? "bg-glow/20 text-glow"
                  : "hover:bg-panelLight text-ink2 hover:text-paper"
              }`}
            >
              <span className="truncate flex-1">{s.title}</span>

              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="ml-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-coral"
              >
                ✕
              </button>
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-xs text-ink2">
              No previous chats
            </p>
          )}
        </div>
      </aside>
    )}

    {/* Chat */}
    <div className="flex flex-col flex-1 bg-panel rounded-2xl overflow-hidden">

      {/* Top Bar */}
      <div className="border-b border-white/10 p-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-glow hover:underline"
            >
              {sidebarOpen ? "Hide History" : "Show History"}
            </button>

            <span className="text-xs text-ink2">
              {supportsSpeech
                ? "🎤 Voice input available"
                : "Voice input needs Chrome"}
            </span>

          </div>

          {supportsSynthesis && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={voiceReplies}
                onChange={(e) =>
                  setVoiceReplies(e.target.checked)
                }
              />
              Read replies aloud
            </label>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {chatLog.length === 0 && (
          <div className="text-ink2">
            🪿 Hi, I'm Goose.
            <br />
            Ask anything, upload an image or use voice.
          </div>
        )}

        {chatLog.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="max-w-full sm:max-w-[85%] lg:max-w-[70%]">

              {m.role === "ai" && (
                <p className="text-xs text-glow mb-1">
                  Goose
                </p>
              )}

              {m.image && (
                <img
                  src={m.image}
                  alt=""
                  className="rounded-xl mb-2 max-h-60"
                />
              )}

              <div
                className={`rounded-2xl px-4 py-3 whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-glow text-ink"
                    : "bg-ink text-paper"
                }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && <Loader label="Goose is typing..." />}
      </div>

      {/* Bottom Input */}
      <div className="border-t border-white/10 p-4 bg-panel">

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">

          {supportsSpeech && (
            <button
              onClick={
                listening
                  ? stopListening
                  : startListening
              }
              className={`h-12 w-12 rounded-xl border ${
                listening
                  ? "border-coral text-coral animate-pulse"
                  : "border-white/10"
              }`}
            >
              {listening ? "●" : "🎤"}
            </button>
          )}

          <label className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer">
            📷
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <input
            value={chatInput}
            onChange={(e) =>
              setChatInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              sendChat(chatInput)
            }
            placeholder="Ask Goose anything..."
            className="
              flex-1
              min-w-[180px]
              h-12
              bg-ink
              rounded-xl
              px-4
              outline-none
              border
              border-white/10
              focus:border-glow
            "
          />

          <button
            onClick={() => sendChat(chatInput)}
            disabled={loading}
            className="
              h-12
              px-6
              rounded-xl
              bg-glow
              text-ink
              font-semibold
              hover:brightness-110
            "
          >
            Send
          </button>

        </div>

      </div>

    </div>

  </div>
);
}
