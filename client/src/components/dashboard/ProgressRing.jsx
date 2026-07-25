import React from "react";

export default function ProgressRing({
  value = 75,
  size = 140,
  strokeWidth = 12,
  color = "#6366F1",
  trackColor = "#23242B",
  title,
  subtitle,
  suffix = "%",
  children,
}) {
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(Math.max(value, 0), 100);

  const dashOffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Track */}

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Progress */}

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition:
                "stroke-dashoffset 0.8s ease",
            }}
          />
        </svg>

        {/* Center */}

        <div
          className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          "
        >
          {children ? (
            children
          ) : (
            <>
              <span className="text-3xl font-bold">
                {value}
                {suffix}
              </span>

              {subtitle && (
                <span className="mt-1 text-xs text-muted">
                  {subtitle}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {title && (
        <h3 className="mt-5 text-lg font-semibold">
          {title}
        </h3>
      )}
    </div>
  );
}