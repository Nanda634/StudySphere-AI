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
  {
    icon: "📊",
    to: "/student/scores",
    title: "My Scores",
    desc: "View every quiz and coding assessment result."
  },
  {
    icon: "🧠",
    to: "/student/assistant",
    title: "Goose AI",
    desc: "Explain concepts, generate notes and ask questions."
  },
  {
    icon: "📚",
    to: "/student/courses",
    title: "Browse Courses",
    desc: "Study engineering, medical and programming subjects."
  },
  {
    icon: "🎯",
    to: "/student/mock-exams",
    title: "Mock Exams",
    desc: "Practice company and competitive exams."
  },
  {
    icon: "📝",
    to: "/student/exam-paper",
    title: "Exam Paper Generator",
    desc: "Generate weighted question papers instantly."
  },
  {
    icon: "❓",
    to: "/student/assistant?mode=quiz",
    title: "Quick Quiz",
    desc: "Test yourself with AI-generated quizzes."
  },
  {
    icon: "📅",
    to: "/student/planner",
    title: "Study Planner",
    desc: "Plan your daily and weekly schedule."
  }
];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">Hey {user?.name?.split(" ")[0]},</h1>
      <p className="text-ink2 text-sm sm:text-base mb-6 sm:mb-8">Here's where things stand today.</p>

      <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    xl:grid-cols-5
    gap-5
    mb-8
  "
>

  <StatCard
    icon="📚"
    color="from-blue-500 to-cyan-500"
    title="Study Items"
    value={history.length}
    subtitle="Notes, Flashcards & Quizzes"
    progress={75}
    trend="+12%"
  />

  <StatCard
    icon="⏱️"
    color="from-green-500 to-emerald-500"
    title="Focus Minutes"
    value={pomodoroStats.totalFocusMinutes}
    subtitle={`${pomodoroStats.totalSessions} Pomodoro Sessions`}
    progress={60}
    trend="+8%"
  />

  <StatCard
    icon="🎓"
    color="from-purple-500 to-pink-500"
    title="Current CGPA"
    value={cgpa?.currentCgpa ?? "--"}
    subtitle={`${cgpa?.totalCredits ?? 0} Credits Completed`}
    progress={cgpa?.currentCgpa ? (cgpa.currentCgpa / 10) * 100 : 0}
  />

  <StatCard
    icon="🔖"
    color="from-orange-500 to-red-500"
    title="Bookmarks"
    value={history.filter((h) => h.bookmarked).length}
    subtitle="Saved for Revision"
    progress={40}
  />

  <Link to="/student/coins" className="block h-full">
  <StatCard
    icon="🪙"
    color="from-yellow-500 to-orange-500"
    title="Study Coins"
    value={coins}
    subtitle="Spend in Mock Exams"
    progress={coins > 0 ? Math.min((coins / 100) * 100, 100) : 0}
  />
</Link>

</div>

      <div className="mb-10">

    <div className="flex items-center justify-between mb-6">

        <div>

            <h2  className="text-xl font-bold text-white">

                Continue Learning

            </h2>

            <p className="text-sm text-slate-400 mt-1">

                Jump back into your favourite study tools.

            </p>

        </div>

    </div>

    <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    xl:grid-cols-3
    gap-5
  "
>

        {quickLinks.map((q) => (

            <Link
                key={q.to}
                to={q.to}
               className="group rounded-xl border border-slate-700
bg-slate-900/70 p-5 sm:p-6
hover:border-blue-500
hover:-translate-y-1
hover:shadow-lg
transition-all duration-300"
            >

                <div className="w-10 h-10 rounded-lg
bg-gradient-to-r
from-blue-500
to-cyan-500
flex items-center justify-center
text-xl
mb-3">

                    {q.icon}

                </div>

                <h3 className="
text-base
sm:text-lg
font-semibold
">

                    {q.title}

                </h3>

                <p className="mt-2 text-sm text-slate-400 leading-6">

                    {q.desc}

                </p>

                <div className="mt-4 text-sm text-blue-400 font-medium">

                    Open →

                </div>

            </Link>

        ))}

    </div>

</div>

      <h2 className="font-display text-xl mb-4">Recent study items</h2>
      {history.length === 0 ? (
        <p
  className="
  text-ink2
  bg-panel
  rounded-2xl
  p-6
  text-center
"
>
          Nothing generated yet. Head to Goose and ask about any topic to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 6).map((item) => (
            <div key={item.id} className="
rounded-xl
border
border-slate-700
bg-slate-900/70
p-4
flex
flex-col
sm:flex-row
sm:items-center
sm:justify-between
gap-2
hover:border-blue-500
transition
">
             <div className="min-w-0">
                <span className="text-xs uppercase text-glow font-mono mr-3">{item.type}</span>
                <span className="break-words">
  {item.topic}
</span>
              </div>
              <span
  className="
  text-ink2
  text-xs
  whitespace-nowrap
  self-start
  sm:self-auto
"
>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
