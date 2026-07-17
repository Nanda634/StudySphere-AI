import React, { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";

export default function Cgpa() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ semester: "", sgpa: "", credits: "" });
  const [prediction, setPrediction] = useState(null);
  const [target, setTarget] = useState({ targetCgpa: "", futureCredits: "" });

  async function load() {
    const { data } = await api.get("/cgpa");
    setRecords(data);
    const pred = await api.post("/cgpa/predict", {});
    setPrediction(pred.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addRecord(e) {
    e.preventDefault();
    if (!form.semester || !form.sgpa || !form.credits) return;
    await api.post("/cgpa", {
      semester: Number(form.semester),
      sgpa: Number(form.sgpa),
      credits: Number(form.credits),
    });
    setForm({ semester: "", sgpa: "", credits: "" });
    load();
  }

  async function remove(id) {
    await api.delete(`/cgpa/${id}`);
    load();
  }

  async function predictTarget(e) {
    e.preventDefault();
    const { data } = await api.post("/cgpa/predict", {
      targetCgpa: Number(target.targetCgpa),
      futureCredits: Number(target.futureCredits),
    });
    setPrediction(data);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">CGPA Calculator</h1>
      <p className="text-ink2 mb-6">Log each semester's SGPA and credits to track your CGPA over time.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <StatCard label="Current CGPA" value={prediction?.currentCgpa ?? "—"} sub={`${prediction?.totalCredits ?? 0} credits logged`} />
        <StatCard
          label="Required future SGPA"
          value={prediction?.requiredFutureSgpa ?? "—"}
          sub="To reach your target CGPA"
        />
      </div>

      <form onSubmit={addRecord} className="bg-panel rounded-2xl p-5 flex flex-wrap gap-3 mb-8">
        <input
          type="number"
          placeholder="Semester"
          value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })}
          className="w-28 bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="number"
          step="0.01"
          placeholder="SGPA"
          value={form.sgpa}
          onChange={(e) => setForm({ ...form, sgpa: e.target.value })}
          className="w-28 bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="number"
          placeholder="Credits"
          value={form.credits}
          onChange={(e) => setForm({ ...form, credits: e.target.value })}
          className="w-28 bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <button className="bg-glow text-ink font-semibold px-5 rounded-lg hover:brightness-110">Add semester</button>
      </form>

      <div className="space-y-2 mb-10">
        {records.map((r) => (
          <div key={r.id} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between">
            <span>Semester {r.semester} — SGPA {r.sgpa} ({r.credits} credits)</span>
            <button onClick={() => remove(r.id)} className="text-coral text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-3">Predict future CGPA</h2>
      <form onSubmit={predictTarget} className="bg-panel rounded-2xl p-5 flex flex-wrap gap-3">
        <input
          type="number"
          step="0.01"
          placeholder="Target CGPA"
          value={target.targetCgpa}
          onChange={(e) => setTarget({ ...target, targetCgpa: e.target.value })}
          className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="number"
          placeholder="Upcoming credits"
          value={target.futureCredits}
          onChange={(e) => setTarget({ ...target, futureCredits: e.target.value })}
          className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <button className="bg-glow text-ink font-semibold px-5 rounded-lg hover:brightness-110">Calculate</button>
      </form>
    </div>
  );
}
