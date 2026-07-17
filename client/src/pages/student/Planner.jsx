import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "", date: "" });

  async function load() {
    const { data } = await api.get("/planner");
    setTasks(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    await api.post("/planner", form);
    setForm({ title: "", subject: "", date: "" });
    load();
  }

  async function toggleDone(task) {
    await api.patch(`/planner/${task.id}`, { done: !task.done });
    load();
  }

  async function remove(id) {
    await api.delete(`/planner/${id}`);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Study Planner</h1>
      <p className="text-ink2 mb-6">Plan daily, weekly, or monthly — whatever keeps you on track.</p>

      <form onSubmit={addTask} className="bg-panel rounded-2xl p-5 flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="flex-1 min-w-[160px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <button className="bg-glow text-ink font-semibold px-5 rounded-lg hover:brightness-110">Add</button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-ink2">No tasks yet — add your first one above.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="bg-panel rounded-xl px-5 py-3 flex items-center gap-4">
            <input type="checkbox" checked={t.done} onChange={() => toggleDone(t)} className="accent-glow w-4 h-4" />
            <div className="flex-1">
              <p className={t.done ? "line-through text-ink2" : ""}>{t.title}</p>
              <p className="text-ink2 text-xs">
                {t.subject && `${t.subject} · `}
                {new Date(t.date).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => remove(t.id)} className="text-coral text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
