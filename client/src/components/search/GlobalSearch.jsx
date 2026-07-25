import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const searchItems = [
  {
    title: "Dashboard",
    description: "Student overview",
    path: "/student/dashboard",
  },
  {
    title: "Courses",
    description: "Browse your courses",
    path: "/student/courses",
  },
  {
    title: "Goose AI",
    description: "Ask anything",
    path: "/student/assistant",
  },
  {
    title: "Planner",
    description: "Study planner",
    path: "/student/planner",
  },
  {
    title: "Mock Exams",
    description: "Practice tests",
    path: "/student/mock-exams",
  },
  {
    title: "Coins",
    description: "Rewards wallet",
    path: "/student/coins",
  },
  {
    title: "Scores",
    description: "View your scores",
    path: "/student/scores",
  },
];

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return searchItems;

    return searchItems.filter((item) =>
      (
        item.title +
        " " +
        item.description
      )
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    setSelected(0);
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!open) return;

      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((prev) =>
          Math.min(prev + 1, results.length - 1)
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((prev) =>
          Math.max(prev - 1, 0)
        );
      }

      if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].path);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selected, navigate, onClose]);

  useEffect(() => {
    const shortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        if (open)
          onClose();
      }
    };

    window.addEventListener("keydown", shortcut);

    return () => window.removeEventListener("keydown", shortcut);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-700">
          <Search className="text-slate-400" size={20} />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search anything..."
            className="flex-1 bg-transparent px-3 py-2 outline-none text-white placeholder:text-slate-500"
          />

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No results found
            </div>
          ) : (
            results.map((item, index) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full text-left px-5 py-4 transition ${
                  index === selected
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                <div className="font-semibold">
                  {item.title}
                </div>

                <div className="text-sm text-slate-400">
                  {item.description}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-slate-700 px-4 py-3 text-xs text-slate-500 flex justify-between">
          <span>↑ ↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}