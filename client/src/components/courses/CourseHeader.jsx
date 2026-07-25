import {
  ChevronRight,
  BookOpen,
  PlayCircle,
  Bookmark,
  Share2,
  Trophy,
} from "lucide-react";

export default function CourseHeader({
  sector,
  course,
  chapterTitle,
  chapterIndex,
  totalChapters,
  onWatchYoutube,
  onBookmark,
  onShare,
}) {
  const progress =
    totalChapters > 0
      ? Math.round(((chapterIndex + 1) / totalChapters) * 100)
      : 0;

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-2xl backdrop-blur-xl overflow-hidden">

      {/* Top */}

      <div className="p-6">

        {/* Breadcrumb */}

        <div className="flex items-center flex-wrap gap-2 text-sm text-slate-400">

          <span>{sector}</span>

          <ChevronRight size={16} />

          <span>{course}</span>

          {chapterTitle && (
            <>
              <ChevronRight size={16} />
              <span className="text-blue-400 font-medium">
                {chapterTitle}
              </span>
            </>
          )}

        </div>

        {/* Title */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-5 gap-5">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <BookOpen className="text-white" size={22} />
              </div>

              <div>

                <h1 className="text-3xl font-bold text-white">
                  {chapterTitle || course}
                </h1>

                <p className="text-slate-400 mt-1">
                  Learn interactively with AI-powered lessons,
                  examples, quizzes and coding practice.
                </p>

              </div>

            </div>

          </div>

          {/* Buttons */}

          <div className="flex flex-wrap gap-3">

            <button
              onClick={onWatchYoutube}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 transition px-5 py-3 rounded-xl text-white"
            >
              <PlayCircle size={18} />
              Watch
            </button>

            <button
              onClick={onBookmark}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition px-5 py-3 rounded-xl text-white"
            >
              <Bookmark size={18} />
              Save
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition px-5 py-3 rounded-xl text-white"
            >
              <Share2 size={18} />
              Share
            </button>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="border-t border-slate-700 px-6 py-5">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-2 text-slate-300">

            <Trophy
              size={18}
              className="text-yellow-400"
            />

            <span>
              Chapter {chapterIndex + 1} of {totalChapters}
            </span>

          </div>

          <span className="font-semibold text-blue-400">
            {progress}%
          </span>

        </div>

        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}