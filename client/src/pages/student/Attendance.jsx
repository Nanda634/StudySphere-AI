import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ subject: "", attended: "", total: "" });
  const [requiredInfo, setRequiredInfo] = useState({});

  async function load() {
    const { data } = await api.get("/attendance");
    setRecords(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!form.subject || form.attended === "" || form.total === "") return;
    await api.post("/attendance", {
      subject: form.subject,
      attended: Number(form.attended),
      total: Number(form.total),
    });
    setForm({ subject: "", attended: "", total: "" });
    load();
  }

  async function checkRequired(subject) {
    const { data } = await api.get(`/attendance/${encodeURIComponent(subject)}/required/75`);
    setRequiredInfo((r) => ({ ...r, [subject]: data.classesNeeded }));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Attendance Tracker</h1>
      <p className="text-ink2 mb-6">Track subject-wise attendance and see what you need to hit 75%.</p>

      <form onSubmit={save} className="bg-panel rounded-2xl p-5 flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="number"
          placeholder="Classes attended"
          value={form.attended}
          onChange={(e) => setForm({ ...form, attended: e.target.value })}
          className="w-40 bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="number"
          placeholder="Total classes"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })}
          className="w-40 bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <button className="bg-glow text-ink font-semibold px-5 rounded-lg hover:brightness-110">Save</button>
      </form>

      <div className="space-y-2">
        {records.map((r) => (
          <div key={r.id} className="bg-panel rounded-xl px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{r.subject}</span>
              <span className={r.percentage >= 75 ? "text-teal" : "text-coral"}>{r.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-ink rounded-full overflow-hidden mb-2">
              <div
                className={`h-full ${r.percentage >= 75 ? "bg-teal" : "bg-coral"}`}
                style={{ width: `${Math.min(r.percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-ink2">
              <span>{r.attended}/{r.total} classes attended</span>
              <button onClick={() => checkRequired(r.subject)} className="text-glow hover:underline">
                Classes needed for 75%?
              </button>
            </div>
            {requiredInfo[r.subject] !== undefined && (
              <p className="text-ink2 text-xs mt-1">
                {requiredInfo[r.subject] === 0
                  ? "You're already at 75% or above 🎉"
                  : `Attend the next ${requiredInfo[r.subject]} classes in a row to reach 75%.`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
