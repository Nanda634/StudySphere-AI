import React from "react";

// Signature element: a warm "lamp glow" halo behind key numbers (streak, timer, CGPA, score)
export default function StatCard({ label, value, sub }) {
  return (
    <div className="relative bg-panel rounded-2xl p-6 overflow-hidden">
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-glow/20 blur-2xl" />
      <p className="text-ink2 text-sm mb-1 relative">{label}</p>
      <p className="font-mono text-3xl font-bold text-glow relative">{value}</p>
      {sub && <p className="text-ink2 text-xs mt-1 relative">{sub}</p>}
    </div>
  );
}
