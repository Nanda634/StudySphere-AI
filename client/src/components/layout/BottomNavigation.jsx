import React from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  BookOpen,
  Sparkles,
  CalendarDays,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    icon: House,
    path: "/student/dashboard",
  },
  {
    label: "Courses",
    icon: BookOpen,
    path: "/student/courses",
  },
  {
    label: "Planner",
    icon: CalendarDays,
    path: "/student/planner",
  },
  {
    label: "Profile",
    icon: User,
    path: "/student/profile",
  },
];

export default function BottomNavigation() {
  return (
    <nav
      className="
      fixed
      bottom-4
      left-1/2
      z-50
      w-[calc(100%-24px)]
      max-w-md
      -translate-x-1/2
      rounded-3xl
      border
      border-border
      bg-card/95
      backdrop-blur-xl
      shadow-2xl
      lg:hidden
      "
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative flex h-20 items-center justify-around">
        {/* Left Side */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition ${
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-white"
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Goose AI Floating Button */}
        <NavLink
          to="/student/assistant"
          className={({ isActive }) =>
            `
            absolute
            left-1/2
            -top-8
            flex
            h-16
            w-16
            -translate-x-1/2
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-primary
            to-secondary
            text-white
            shadow-glow
            transition-all
            duration-300
            ${
              isActive
                ? "scale-110 ring-4 ring-primary/30"
                : "hover:scale-110"
            }
            `
          }
        >
          <Sparkles size={28} />
        </NavLink>

        {/* Right Side */}
        {navItems.slice(2).map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition ${
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-white"
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}