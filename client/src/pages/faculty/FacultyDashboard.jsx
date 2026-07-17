import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function FacultyDashboard() {
  const { user } = useAuth();

  const tools = [
    { to: "/faculty/materials", title: "Materials", desc: "Upload notes, reference material, and video class links." },
    { to: "/faculty/assignments", title: "Assignments", desc: "Goose auto-generates quizzes for you to assign." },
    { to: "/faculty/live-classes", title: "Live Classes", desc: "Schedule live sessions and share the room link." },
    { to: "/faculty/analytics", title: "Analytics", desc: "See how students are doing, by topic." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Welcome, {user?.name?.split(" ")[0]}</h1>
      <p className="text-ink2 mb-8">Your faculty workspace.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="bg-panel hover:bg-panelLight transition rounded-2xl p-5 block">
            <h3 className="font-display text-lg mb-1">{t.title}</h3>
            <p className="text-ink2 text-sm">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
