import React from "react";

export default function Input({ label, className = "", ...props }) {
  return (
    <div>
      {label && <label className="text-sm text-ink2 block mb-1">{label}</label>}
      <input
        className={`w-full bg-ink border border-white/10 rounded-lg px-4 py-2 focus:border-glow outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
