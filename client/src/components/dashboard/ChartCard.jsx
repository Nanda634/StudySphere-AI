import React from "react";
import { MoreHorizontal } from "lucide-react";

export default function ChartCard({
  title,
  subtitle,
  children,
  actions,
  height = 320,
  className = "",
}) {
  return (
    <div
      className={`
      relative
      overflow-hidden
      rounded-3xl
      border
      border-border
      bg-card
      shadow-soft
      transition-all
      duration-300
      hover:shadow-hover
      ${className}
      `}
    >
      {/* Background Glow */}

      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}

      <div className="relative z-10 flex items-center justify-between border-b border-border px-6 py-5">

        <div>

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted">
              {subtitle}
            </p>
          )}

        </div>

        <div className="flex items-center gap-2">

          {actions}

          <button
            className="
            rounded-xl
            p-2
            transition
            hover:bg-elevated
            "
          >
            <MoreHorizontal size={18} />
          </button>

        </div>

      </div>

      {/* Chart */}

      <div
        className="relative z-10 p-6"
        style={{
          minHeight: height,
        }}
      >
        {children}
      </div>
    </div>
  );
}