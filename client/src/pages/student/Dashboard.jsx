import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState({ totalSessions: 0, totalFocusMinutes: 0 });
  const [cgpa, setCgpa] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    api.get("/ai/history").then((r) => setHistory(r.data)).catch(() => {});
    api.get("/pomodoro/stats").then((r) => setPomodoroStats(r.data)).catch(() => {});
    api.post("/cgpa/predict", {}).then((r) => setCgpa(r.data)).catch(() => {});
    api.get("/coins").then((r) => setCoins(r.data.balance)).catch(() => {});
  }, []);

  const quickLinks = [
    { to: "/student/scores", title: "My Scores", desc: "See every quiz and coding assessment result — retake to improve." },
    { to: "/student/assistant", title: "Ask Goose to explain a topic", desc: "Get a clear breakdown of anything." },
    { to: "/student/courses", title: "Browse Courses", desc: "Core subjects across engineering, medical, and more." },
    { to: "/student/mock-exams", title: "Real-World Mock Exams", desc: "Spend coins on TCS, Amazon, JEE, NEET-style tests." },
    { to: "/student/exam-paper", title: "Generate an Exam Paper", desc: "Marks-weighted written paper from a topic or PDF." },
    { to: "/student/assistant?mode=quiz", title: "Take a quiz", desc: "Scored quiz with instant AI feedback + coins." },
    { to: "/student/planner", title: "Plan your week", desc: "Add tasks to your study planner." },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Hey {user?.name?.split(" ")[0]},</h1>
      <p className="text-ink2 mb-8">Here's where things stand today.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Study items generated" value={history.length} sub="Notes, flashcards, MCQs & more" />
        <StatCard
          label="Focus minutes logged"
          value={pomodoroStats.totalFocusMinutes}
          sub={`${pomodoroStats.totalSessions} sessions`}
        />
        <StatCard label="Current CGPA" value={cgpa?.currentCgpa ?? "—"} sub={`${cgpa?.totalCredits ?? 0} credits logged`} />
        <StatCard label="Bookmarked items" value={history.filter((h) => h.bookmarked).length} sub="Saved for revision" />
        <Link to="/student/coins">
          <StatCard label="Coin balance" value={`🪙 ${coins}`} sub="Tap to see history & spend" />
        </Link>
      </div>

      <h2 className="font-display text-xl mb-4">Jump back in</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {quickLinks.map((q) => (
          <Link key={q.to + q.title} to={q.to} className="bg-panel hover:bg-panelLight transition rounded-2xl p-5 block">
            <h3 className="font-medium mb-1">{q.title}</h3>
            <p className="text-ink2 text-sm">{q.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-xl mb-4">Recent study items</h2>
      {history.length === 0 ? (
        <p className="text-ink2 bg-panel rounded-2xl p-6">
          Nothing generated yet. Head to Goose and ask about any topic to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {history.slice(0, 6).map((item) => (
            <div key={item.id} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-glow font-mono mr-3">{item.type}</span>
                <span>{item.topic}</span>
              </div>
              <span className="text-ink2 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
