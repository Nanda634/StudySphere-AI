import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Award,
  CheckCircle2,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    icon: BrainCircuit,
    title: "Goose AI",
    message: "Your AI summary is ready.",
    time: "2 min ago",
    color: "text-violet-400",
  },
  {
    id: 2,
    icon: CalendarDays,
    title: "Planner",
    message: "You have 2 study sessions today.",
    time: "15 min ago",
    color: "text-blue-400",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Course",
    message: "New notes uploaded.",
    time: "1 hour ago",
    color: "text-green-400",
  },
  {
    id: 4,
    icon: Award,
    title: "Achievement",
    message: "You earned 50 coins!",
    time: "Today",
    color: "text-yellow-400",
  },
];

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () =>
      document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Bell */}

      <button
        onClick={() => setOpen(!open)}
        className="
        relative
        rounded-xl
        border
        border-border
        bg-card
        p-3
        transition
        hover:bg-elevated
        "
      >
        <Bell size={20} />

        <span
          className="
          absolute
          right-2
          top-2
          h-2.5
          w-2.5
          rounded-full
          bg-red-500
          "
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
          absolute
          right-0
          mt-3
          w-96
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card
          shadow-2xl
          animate-fadeIn
          "
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-border p-5">

            <h3 className="text-lg font-semibold">
              Notifications
            </h3>

            <button
              className="
              text-sm
              text-primary
              hover:underline
              "
            >
              Mark all read
            </button>

          </div>

          {/* List */}

          <div className="max-h-96 overflow-y-auto">

            {notifications.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className="
                  flex
                  w-full
                  gap-4
                  border-b
                  border-border
                  p-4
                  text-left
                  transition
                  hover:bg-elevated
                  "
                >
                  <div
                    className={`
                    mt-1
                    ${item.color}
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between">

                      <h4 className="font-semibold">
                        {item.title}
                      </h4>

                      <span className="text-xs text-muted">
                        {item.time}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-muted">
                      {item.message}
                    </p>

                  </div>

                </button>
              );

            })}

          </div>

          {/* Footer */}

          <button
            className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            p-4
            font-medium
            hover:bg-elevated
            "
          >
            <CheckCircle2 size={18} />

            View All Notifications
          </button>

        </div>
      )}
    </div>
  );
}