import React, { useState } from "react";

export default function FlashcardsView({ cards = [] }) {
  const [flipped, setFlipped] = useState({});
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {cards.map((c, i) => (
        <button
          key={i}
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          className="bg-panel rounded-2xl p-5 text-left hover:bg-panelLight transition min-h-[120px]"
        >
          {!flipped[i] ? (
            <>
              <p className="text-xs text-glow font-mono mb-2">Q</p>
              <p>{c.question}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-teal font-mono mb-2">A</p>
              <p className="mb-2">{c.answer}</p>
              <p className="text-ink2 text-xs italic">💡 {c.memoryTip}</p>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
