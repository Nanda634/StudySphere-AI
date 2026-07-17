import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-display italic text-paper">
          StudySphere <span className="text-glow not-italic">AI</span>
        </p>
        <p className="text-ink2 text-sm">One Platform. Infinite Learning. Powered by AI.</p>
      </div>
    </footer>
  );
}
