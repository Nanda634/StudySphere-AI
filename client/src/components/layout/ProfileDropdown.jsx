import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  User,
  Settings,
  GraduationCap,
  Coins,
  LogOut,
  Moon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
    setDarkMode(false);
  } else {
    document.documentElement.classList.add("dark");
    setDarkMode(true);
  }
}, []);

const toggleDarkMode = () => {
  if (darkMode) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }

  setDarkMode(!darkMode);
  setOpen(false);
};
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const menu = [
  {
    icon: User,
    label: "My Profile",
    action: () => navigate("/student/profile"),
  },
  {
    icon: GraduationCap,
    label: "My Progress",
    action: () => navigate("/student/progress"),
  },
  {
    icon: Coins,
    label: "Coins Wallet",
    action: () => navigate("/student/coins"),
  },
  {
    icon: Settings,
    label: "Settings",
    action: () => navigate("/student/settings"),
  },
];

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* Trigger */}

      <button
        onClick={() => setOpen(!open)}
        className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-border
        bg-card
        px-2
        py-2
        hover:bg-elevated
        transition
        "
      >
        <div
          className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-gradient-to-r
          from-primary
          to-secondary
          text-white
          font-bold
          "
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
          absolute
          right-0
          mt-3
          w-72
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card
          shadow-2xl
          animate-fadeIn
          "
        >
          {/* User */}

          <div className="border-b border-border p-5">
            <h3 className="font-semibold text-lg">
              {user?.name}
            </h3>

            <p className="text-sm text-muted">
              {user?.email}
            </p>
          </div>

          {/* Menu */}

          <div className="py-2">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setOpen(false);
                    item.action();
                  }}
                  className="
                  flex
                  w-full
                  items-center
                  gap-3
                  px-5
                  py-3
                  hover:bg-elevated
                  transition
                  "
                >
                  <Icon size={18} />

                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}

          <div className="border-t border-border py-2">
            <button
              className="
              flex
              w-full
              items-center
              gap-3
              px-5
              py-3
              hover:bg-elevated
              transition
              "
            >
              <Moon size={18} />

              Dark Mode
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
              px-5
              py-3
              text-red-400
              hover:bg-red-500/10
              transition
              "
            >
              <LogOut size={18} />

              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}