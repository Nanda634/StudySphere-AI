import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  BrainCircuit,
  BookOpen,
  FileText,
  ClipboardList,
  CalendarDays,
  TimerReset,
  GraduationCap,
  Users,
  Coins,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";

const links = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
  },
  {
    title: "Goose AI",
    icon: BrainCircuit,
    path: "/student/assistant",
  },
  {
    title: "Courses",
    icon: BookOpen,
    path: "/student/courses",
  },
  {
    title: "Exam Paper",
    icon: FileText,
    path: "/student/exam-paper",
  },
  {
    title: "Mock Exams",
    icon: ClipboardList,
    path: "/student/mock-exams",
  },
  {
    title: "Planner",
    icon: CalendarDays,
    path: "/student/planner",
  },
  {
    title: "Pomodoro",
    icon: TimerReset,
    path: "/student/pomodoro",
  },
  {
    title: "Attendance",
    icon: Users,
    path: "/student/attendance",
  },
  {
    title: "CGPA",
    icon: GraduationCap,
    path: "/student/cgpa",
  },
  {
    title: "Coins",
    icon: Coins,
    path: "/student/coins",
  },
  {
    title: "Scores",
    icon: Trophy,
    path: "/student/scores",
  },
];

export default function MobileDrawer({
  open,
  onClose,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      />

      {/* Drawer */}

      <aside
        className="
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        w-80
        flex-col
        border-r
        border-border
        bg-background
        shadow-2xl
        animate-slideIn
        lg:hidden
        "
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-border p-6">

          <Logo />

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-card"
          >
            <X size={22} />
          </button>

        </div>

        {/* User */}

        <div className="border-b border-border p-6">

          <div className="flex items-center gap-4">

            <div
              className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-primary
              to-secondary
              text-xl
              font-bold
              text-white
              "
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>

              <h3 className="font-semibold text-lg">

                {user?.name}

              </h3>

              <p className="text-sm text-muted">

                {user?.email}

              </p>

            </div>

          </div>

        </div>

        {/* Goose Shortcut */}

        <div className="p-5">

          <NavLink
            to="/student/assistant"
            onClick={onClose}
            className="
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-gradient-to-r
            from-primary
            to-secondary
            py-3
            font-semibold
            text-white
            shadow-glow
            "
          >
            <Sparkles size={18} />

            Ask Goose AI

          </NavLink>

        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-4">

          <div className="space-y-2">

            {links.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    px-4
                    py-3
                    transition

                    ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "text-muted hover:bg-card hover:text-white"
                    }
                    `
                  }
                >
                  <Icon size={20} />

                  {item.title}

                </NavLink>
              );

            })}

          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-border p-4 space-y-2">

          <button
            className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            hover:bg-card
            "
          >
            <Settings size={20} />

            Settings

          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-red-400
            hover:bg-red-500/10
            "
          >
            <LogOut size={20} />

            Logout

          </button>

        </div>

      </aside>
    </>
  );
}