import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/" }) {
  return (
    <Link to={to} className="font-display italic text-xl text-paper">
      StudySphere <span className="text-glow not-italic">AI</span>
    </Link>
  );
}
