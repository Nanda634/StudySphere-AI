import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Analytics() {
  const [data, setData] = useState({ recentAttempts: [], topicSummary: [] });

  useEffect(() => {
    api.get("/faculty/analytics").then((r) => setData(r.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Student Analytics</h1>
      <p className="text-ink2 mb-6">Performance across all quiz and exam attempts on the platform.</p>

      <h2 className="font-display text-lg mb-3 text-glow">By topic</h2>
      {data.topicSummary.length === 0 ? (
        <p className="text-ink2 bg-panel rounded-2xl p-6 mb-8">No quiz attempts recorded yet.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {data.topicSummary
            .sort((a, b) => a.averagePercent - b.averagePercent)
            .map((t) => (
              <div key={t.topic} className="bg-panel rounded-xl px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{t.topic}</span>
                  <span className={t.averagePercent >= 60 ? "text-teal" : "text-coral"}>{t.averagePercent}%</span>
                </div>
                <div className="w-full h-2 bg-ink rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${t.averagePercent >= 60 ? "bg-teal" : "bg-coral"}`}
                    style={{ width: `${Math.min(t.averagePercent, 100)}%` }}
                  />
                </div>
                <p className="text-ink2 text-xs">{t.attempts} attempt(s)</p>
              </div>
            ))}
        </div>
      )}

      <h2 className="font-display text-lg mb-3 text-glow">Recent attempts</h2>
      {data.recentAttempts.length === 0 ? (
        <p className="text-ink2 bg-panel rounded-2xl p-6">Nothing yet.</p>
      ) : (
        <div className="space-y-2">
          {data.recentAttempts.map((a, i) => (
            <div key={i} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between">
              <span>{a.studentName} — {a.topic}</span>
              <span className="font-mono text-sm">{a.score}/{a.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
