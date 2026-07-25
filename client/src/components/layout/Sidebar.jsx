import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Calendar,
  ClipboardList,
  Coins,
  Trophy,
} from "lucide-react";

export default function Sidebar({ sidebarOpen }) {
  const menuItems = [
    {
      icon: <LayoutDashboard size={22} />,
      text: "Dashboard",
      path: "/student/dashboard",
    },
    {
      icon: <BookOpen size={22} />,
      text: "Courses",
      path: "/student/courses",
    },
    {
      icon: <Brain size={22} />,
      text: "Goose AI",
      path: "/student/assistant",
    },
    {
      icon: <Calendar size={22} />,
      text: "Planner",
      path: "/student/planner",
    },
    {
      icon: <ClipboardList size={22} />,
      text: "Mock Exams",
      path: "/student/mock-exams",
    },
    {
      icon: <Coins size={22} />,
      text: "Coins",
      path: "/student/coins",
    },
    {
      icon: <Trophy size={22} />,
      text: "Scores",
      path: "/student/scores",
    },
  ];

  return (
    <aside
      className={`
    fixed md:relative
    top-16 md:top-0
    left-0
    z-40
    h-[calc(100vh-64px)]
    bg-slate-900
    border-r border-slate-700
    transition-all duration-300

    ${
      sidebarOpen
        ? "translate-x-0 w-64"
        : "-translate-x-full md:translate-x-0 md:w-20"
    }
  `}
    >
      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${
                sidebarOpen ? "justify-start" : "justify-center"
              } gap-3 rounded-xl px-3 py-3 transition-all duration-200
              ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}

            {sidebarOpen && (
              <span className="font-medium whitespace-nowrap">
                {item.text}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}