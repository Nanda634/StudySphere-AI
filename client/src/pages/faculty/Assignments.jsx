import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ subject: "", title: "", topic: "", difficulty: "intermediate", count: 10, dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.get("/faculty/assignments").then((r) => setAssignments(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.subject || !form.title || !form.topic) return;
    setLoading(true);
    try {
      await api.post("/faculty/assignments/generate", { ...form, count: Number(form.count) });
      setForm({ subject: "", title: "", topic: "", difficulty: "intermediate", count: 10, dueDate: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't generate that assignment.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    await api.delete(`/faculty/assignments/${id}`);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Assignments</h1>
      <p className="text-ink2 mb-6">Goose generates the quiz automatically — just tell it the topic and difficulty.</p>

      <form onSubmit={submit} className="bg-panel rounded-2xl p-5 space-y-3 mb-8">
        {error && <p className="text-coral text-sm">{error}</p>}
        <div className="flex gap-3 flex-wrap">
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
          <input
            placeholder="Assignment title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
        </div>
        <input
          placeholder="Topic for Goose to quiz on"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
        />
        <div className="flex gap-3 flex-wrap">
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={form.count}
            onChange={(e) => setForm({ ...form, count: e.target.value })}
            className="bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={20}>20 questions</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
          />
        </div>
        <button disabled={loading} className="bg-glow text-ink font-semibold px-5 py-2 rounded-lg hover:brightness-110 disabled:opacity-50">
          {loading ? "Goose is generating..." : "Generate & Assign"}
        </button>
      </form>

      {loading && <Loader label="Goose is writing the assignment..." />}

      <div className="space-y-2">
        {assignments.map((a) => (
          <div key={a.id} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between">
            <div>
              <span className="font-medium">{a.title}</span>
              <span className="text-ink2 text-sm ml-2">
                · {a.subject} · {a.quizContent.questions.length} questions · {a.difficulty}
                {a.dueDate && ` · due ${new Date(a.dueDate).toLocaleDateString()}`}
              </span>
            </div>
            <button onClick={() => remove(a.id)} className="text-coral text-sm hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
