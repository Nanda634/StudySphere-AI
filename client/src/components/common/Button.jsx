import React from "react";

const VARIANTS = {
  primary: "bg-glow text-ink hover:brightness-110",
  outline: "border border-white/10 text-paper hover:bg-panel",
  ghost: "text-ink2 hover:text-paper",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
