import React from "react";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-display text-lg mb-2 text-glow">{title}</h3>
      {children}
    </div>
  );
}

function Bullets({ items = [] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-ink2">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function ExplainView({ result }) {
  return (
    <div className="bg-panel rounded-2xl p-6 space-y-5">
      <Section title="Explanation"><p className="whitespace-pre-wrap text-ink2">{result.explanation}</p></Section>
      <Section title="Key Points"><Bullets items={result.keyPoints} /></Section>
      <Section title="Summary"><p className="text-ink2">{result.summary}</p></Section>
      <Section title="Examples"><Bullets items={result.examples} /></Section>
      <Section title="Real-world Applications"><Bullets items={result.realWorldApplications} /></Section>
    </div>
  );
}

export function NotesView({ result }) {
  return (
    <div className="bg-panel rounded-2xl p-6 space-y-5">
      <Section title="Short Notes"><Bullets items={result.shortNotes} /></Section>
      <Section title="Detailed Notes"><p className="whitespace-pre-wrap text-ink2">{result.detailedNotes}</p></Section>
      <Section title="Exam Notes"><Bullets items={result.examNotes} /></Section>
      <Section title="Revision Notes"><Bullets items={result.revisionNotes} /></Section>
    </div>
  );
}
