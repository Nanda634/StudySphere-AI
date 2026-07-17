import React from "react";

export default function Card({ children, className = "" }) {
  return <div className={`bg-panel rounded-2xl p-6 ${className}`}>{children}</div>;
}
