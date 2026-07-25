import React from "react";
import { ChevronRight } from "lucide-react";

export default function ActivityCard({
  icon,
  title,
  description,
  time,
  badge,
  badgeColor = "bg-primary/15 text-primary",
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
      group
      flex
      w-full
      items-center
      gap-4
      rounded-3xl
      border
      border-border
      bg-card
      p-5
      text-left
      shadow-soft
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-primary/30
      hover:shadow-hover
      "
    >
      {/* Icon */}

      <div
        className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        bg-primary/10
        text-primary
        "
      >
        {icon}
      </div>

      {/* Content */}

      <div className="flex-1">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-text">
            {title}
          </h3>

          {badge && (
            <span
              className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-medium
              ${badgeColor}
              `}
            >
              {badge}
            </span>
          )}

        </div>

        {description && (
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}

        {time && (
          <p className="mt-3 text-xs text-muted">
            {time}
          </p>
        )}

      </div>

      {/* Arrow */}

      <ChevronRight
        size={20}
        className="
        text-muted
        transition-transform
        duration-300
        group-hover:translate-x-1
        "
      />

    </button>
  );
}