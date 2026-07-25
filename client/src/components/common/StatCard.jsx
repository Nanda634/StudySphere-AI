import React from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  label,
  value,
  subtitle,
  sub,
  icon,
  trend,
  trendLabel = "vs last week",
  progress,
  color = "from-blue-500 to-cyan-500",
  onClick,
  className = "",
}) {
  const heading = title || label;
  const description = subtitle || sub;

  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        w-full
        min-h-[240px]
        rounded-3xl
        border
        border-slate-700
        bg-slate-900/80
        p-5
        sm:p-6
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-blue-500
        hover:shadow-[0_0_35px_rgba(59,130,246,.25)]
        cursor-pointer
        ${className}
      `}
    >
      {/* Background Glow */}
      <div
        className={`
          absolute
          -right-12
          -top-12
          h-40
          w-40
          sm:h-44
          sm:w-44
          rounded-full
          bg-gradient-to-br
          ${color}
          opacity-10
          blur-3xl
          group-hover:opacity-20
          transition
        `}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">

        <div className="flex-1 min-w-0">

          <p className="text-slate-400 text-sm sm:text-base font-medium">
            {heading}
          </p>

          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white break-words">
            {value}
          </h2>

        </div>

        <div
          className={`
            flex
            h-14
            w-14
            sm:h-16
            sm:w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            ${color}
            text-2xl
            sm:text-3xl
            shadow-lg
          `}
        >
          {icon || "📊"}
        </div>

      </div>

      {description && (
        <p className="relative z-10 mt-5 text-sm sm:text-base text-slate-400 break-words">
          {description}
        </p>
      )}

      {progress !== undefined && (
        <div className="relative z-10 mt-6">

          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

            <span>Progress</span>

            <span>{progress}%</span>

          </div>

          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">

            <div
              className={`h-full rounded-full bg-gradient-to-r ${color}`}
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>
      )}

      {trend && (
        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">

          <TrendingUp
            size={18}
            className="text-green-400 shrink-0"
          />

          <span className="font-semibold text-green-400">
            {trend}
          </span>

          <span className="text-sm text-slate-400">
            {trendLabel}
          </span>

        </div>
      )}
    </div>
  );
}