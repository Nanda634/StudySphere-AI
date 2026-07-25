import React from "react";

export default function Card({
  children,

  className = "",

  hover = true,

  glass = false,

  gradient = false,

  padding = "p-6",

  rounded = "rounded-3xl",

  border = true,

  shadow = true,

  onClick,

  ...props
}) {
  const base = `
    relative
    overflow-hidden
    transition-all
    duration-300
    ease-out
    ${rounded}
    ${padding}
  `;

  const background = glass
    ? `
      bg-white/5
      backdrop-blur-xl
      border-white/10
    `
    : gradient
    ? `
      bg-gradient-to-br
      from-card
      via-card
      to-elevated
    `
    : `
      bg-card
    `;

  const borderStyle = border
    ? "border border-border"
    : "";

  const shadowStyle = shadow
    ? "shadow-soft"
    : "";

  const hoverStyle = hover
    ? `
      hover:-translate-y-1
      hover:shadow-hover
      hover:border-primary/30
    `
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        ${base}
        ${background}
        ${borderStyle}
        ${shadowStyle}
        ${hoverStyle}
        ${className}
      `}
      {...props}
    >
      {/* Gradient Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}