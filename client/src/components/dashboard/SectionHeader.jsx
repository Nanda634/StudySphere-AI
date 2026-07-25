import React from "react";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({
  title,
  subtitle,
  actionText,
  onAction,
  children,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-text">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}

        {actionText && (
          <button
            onClick={onAction}
            className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            py-3
            font-semibold
            text-white
            transition
            hover:scale-105
            "
          >
            {actionText}

            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}