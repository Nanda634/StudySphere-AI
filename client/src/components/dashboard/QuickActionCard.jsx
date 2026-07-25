import React from "react";
import { ArrowRight } from "lucide-react";

export default function QuickActionCard({
  title,
  description,
  icon,
  color = "from-primary to-secondary",
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      border-border
      bg-card
      p-6
      text-left
      shadow-soft
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-hover
      "
    >
      <div
        className={`
        absolute
        -right-10
        -top-10
        h-32
        w-32
        rounded-full
        bg-gradient-to-r
        ${color}
        opacity-10
        blur-3xl
        `}
      />

      <div
        className={`
        mb-5
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-r
        ${color}
        text-white
        `}
      >
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 font-medium text-primary">
        Open

        <ArrowRight
          size={18}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}