import { useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export default function CourseSidebar({
  course,
  chapters = [],
  chapterIndex,
  setChapterIndex,
  loading,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return chapters;

    return chapters.filter((chapter) =>
      chapter.toLowerCase().includes(search.toLowerCase())
    );
  }, [chapters, search]);

  return (
    <aside className="w-full lg:w-80 bg-slate-900/70 border border-slate-700 rounded-2xl backdrop-blur-xl overflow-hidden">

      {/* Header */}

      <div className="p-6 border-b border-slate-700">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap className="text-white" size={22} />
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg">
              {course}
            </h2>

            <p className="text-slate-400 text-sm">
              {chapters.length} Lessons
            </p>
          </div>

        </div>

        {/* Search */}

        <div className="mt-5 relative">

          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapter..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white outline-none focus:border-blue-500 transition"
          />

        </div>

      </div>

      {/* Chapters */}

      <div className="max-h-[650px] overflow-y-auto">

        {loading && (
          <div className="p-6 text-center text-slate-400">
            Loading course...
          </div>
        )}

        {!loading &&
          filtered.map((chapter) => {
            const actualIndex = chapters.indexOf(chapter);

            const active = actualIndex === chapterIndex;

            return (
              <button
                key={chapter}
                onClick={() => setChapterIndex(actualIndex)}
                className={`w-full text-left px-5 py-4 transition flex items-start gap-3 border-l-4

                ${
                  active
                    ? "bg-blue-600/20 border-blue-500"
                    : "border-transparent hover:bg-slate-800"
                }
                `}
              >
                <BookOpen
                  size={18}
                  className={
                    active
                      ? "text-blue-400 mt-1"
                      : "text-slate-500 mt-1"
                  }
                />

                <div className="flex-1">

                  <p
                    className={`font-medium

                    ${
                      active
                        ? "text-white"
                        : "text-slate-300"
                    }
                    `}
                  >
                    {chapter}
                  </p>

                </div>

                <ChevronRight
                  size={18}
                  className={
                    active
                      ? "text-blue-400"
                      : "text-slate-600"
                  }
                />

              </button>
            );
          })}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-700 p-5">

        <div className="flex justify-between text-sm text-slate-400">

          <span>Progress</span>

          <span>
            {chapters.length
              ? Math.round(((chapterIndex + 1) / chapters.length) * 100)
              : 0}
            %
          </span>

        </div>

        <div className="mt-2 h-2 rounded-full bg-slate-800">

          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${
                chapters.length
                  ? ((chapterIndex + 1) / chapters.length) * 100
                  : 0
              }%`,
            }}
          />

        </div>

      </div>

    </aside>
  );
}