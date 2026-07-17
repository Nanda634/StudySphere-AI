import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 pt-32 text-center">
      <p className="font-mono text-glow text-6xl mb-4">404</p>
      <h1 className="font-display text-2xl mb-2">This page doesn't exist</h1>
      <p className="text-ink2 mb-8">Check the URL, or head back to your dashboard.</p>
      <Link to="/" className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 transition">
        Back to home
      </Link>
    </div>
  );
}
