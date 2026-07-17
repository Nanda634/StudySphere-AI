import React, { useState } from "react";

const FAQS = [
  ["Is StudySphere AI free to use?", "Yes — creating an account and using the core study tools is free."],
  ["What kind of PDFs can I upload?", "Text-based PDFs work today. Scanned or handwritten PDFs need OCR, which is on our roadmap."],
  ["Which exams does it support?", "Anything you can name a topic for — school boards, engineering, medical, law, UPSC, SSC, banking, GATE, GRE, CAT, and more."],
  ["Can teachers use it too?", "A faculty workspace for uploading materials and tracking students is coming soon."],
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-3xl mb-8 text-center">Frequently asked questions</h2>
      <div className="space-y-2">
        {FAQS.map(([q, a], i) => (
          <div key={q} className="bg-panel rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <span className="font-medium">{q}</span>
              <span className="text-glow">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="text-ink2 text-sm px-5 pb-4">{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
