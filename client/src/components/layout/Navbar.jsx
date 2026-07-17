import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../common/Logo";

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/assistant", label: "Goose" },
  { to: "/student/courses", label: "Courses" },
];
const STUDENT_MORE = [
  { to: "/student/exam-paper", label: "Exam Paper" },
  { to: "/student/mock-exams", label: "Mock Exams" },
  { to: "/student/assigned-quizzes", label: "Assignments" },
  { to: "/student/scores", label: "My Scores" },
  { to: "/student/coins", label: "Coins" },
  { to: "/student/planner", label: "Planner" },
  { to: "/student/pomodoro", label: "Pomodoro" },
  { to: "/student/cgpa", label: "CGPA" },
  { to: "/student/attendance", label: "Attendance" },
  { to: "/live-classes", label: "Live Classes" },
];

const FACULTY_LINKS = [
  { to: "/faculty/dashboard", label: "Dashboard" },
  { to: "/faculty/materials", label: "Materials" },
  { to: "/faculty/assignments", label: "Assignments" },
];
const FACULTY_MORE = [
  { to: "/live-classes", label: "Live Classes" },
  { to: "/faculty/analytics", label: "Analytics" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const primary = user?.role === "FACULTY" ? FACULTY_LINKS : STUDENT_LINKS;
  const more = user?.role === "FACULTY" ? FACULTY_MORE : STUDENT_MORE;

  useEffect(() => {
    function onClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${
      isActive ? "border-glow text-paper bg-panel" : "border-transparent text-ink2 hover:text-paper hover:bg-panel/50"
    }`;

  return (
    <header className="border-b border-white/5 bg-ink/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 gap-4">
        <Logo to={user ? (user.role === "FACULTY" ? "/faculty/dashboard" : "/student/dashboard") : "/"} />

        {user && (
          <nav className="hidden md:flex items-end gap-0.5">
            {primary.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className={`px-3 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                  moreOpen ? "border-glow text-paper bg-panel" : "border-transparent text-ink2 hover:text-paper hover:bg-panel/50"
                }`}
                title="More"
              >
                ⋯
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-panel border border-white/10 rounded-xl shadow-lg py-2 z-30">
                  {more.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${isActive ? "text-glow" : "text-ink2 hover:text-paper hover:bg-panelLight"}`
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}

        {user ? (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-sm text-ink2 hover:text-coral transition-colors whitespace-nowrap"
          >
            Sign out
          </button>
        ) : (
          <NavLink to="/student/login" className="text-sm text-glow hover:underline whitespace-nowrap">
            Sign in
          </NavLink>
        )}
      </div>

      {/* Mobile: flat wrap of everything, no overflow menu needed at this width */}
      {user && (
        <nav className="md:hidden flex flex-wrap gap-1 px-4 pb-3">
          {[...primary, ...more].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-2.5 py-1 text-xs rounded-full border ${isActive ? "border-glow text-glow" : "border-white/10 text-ink2"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
