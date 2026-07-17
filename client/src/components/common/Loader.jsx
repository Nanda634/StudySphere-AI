import React from "react";

export default function Loader({ label = "Thinking..." }) {
  return (
    <div className="flex items-center gap-3 text-ink2 py-8 justify-center">
      <div className="w-5 h-5 border-2 border-glow border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}
