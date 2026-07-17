import React from "react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h2 className="font-display text-3xl mb-4">Ready to study smarter tonight?</h2>
      <p className="text-ink2 mb-8">It's free, and your first study kit is a minute away.</p>
      <Link
        to="/student/register"
        className="bg-glow text-ink font-semibold px-8 py-3 rounded-full shadow-lamp hover:brightness-110 transition inline-block"
      >
        Start studying free
      </Link>
    </section>
  );
}
