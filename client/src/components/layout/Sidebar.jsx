import React from "react";
import { NavLink } from "react-router-dom";

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/assistant", label: "AI Assistant" },
  { to: "/student/planner", label: "Planner" },
  { to: "/student/pomodoro", label: "Pomodoro" },
  { to: "/student/cgpa", label: "CGPA" },
  { to: "/student/attendance", label: "Attendance" },
];

// A vertical nav alternative to Navbar's top tabs — handy for a mobile drawer
// or a wider desktop layout. Not wired in by default; import and render
// wherever a side-nav layout is preferred over the top nav.
export default function Sidebar({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 w-56 bg-panel rounded-2xl p-3">
      {STUDENT_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `px-4 py-2 text-sm rounded-lg transition-colors ${
              isActive ? "bg-glow/20 text-glow" : "text-ink2 hover:text-paper hover:bg-panelLight"
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
