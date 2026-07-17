import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LiveClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "", roomLink: "", scheduledAt: "" });
  const [error, setError] = useState("");

  function load() {
    api.get("/faculty/live-classes").then((r) => setClasses(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.subject || !form.roomLink || !form.scheduledAt) return;
    try {
      await api.post("/faculty/live-classes", form);
      setForm({ title: "", subject: "", roomLink: "", scheduledAt: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't schedule that class.");
    }
  }

  async function remove(id) {
    await api.delete(`/faculty/live-classes/${id}`);
    load();
  }

  const isFaculty = user?.role === "FACULTY";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Live Classes</h1>
      <p className="text-ink2 mb-6">
        {isFaculty ? "Schedule a live class by sharing your meeting room link." : "Upcoming live classes from your faculty."}
      </p>

      {isFaculty && (
        <form onSubmit={submit} className="bg-panel rounded-2xl p-5 space-y-3 mb-8">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="flex gap-3 flex-wrap">
            <input
              placeholder="Class title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
            />
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
            />
          </div>
          <input
            placeholder="Room link (Google Meet, Zoom, etc.)"
            value={form.roomLink}
            onChange={(e) => setForm({ ...form, roomLink: e.target.value })}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
          <button className="bg-glow text-ink font-semibold px-5 py-2 rounded-lg hover:brightness-110">Schedule Class</button>
        </form>
      )}

      <div className="space-y-2">
        {classes.length === 0 && <p className="text-ink2 bg-panel rounded-2xl p-6">No live classes scheduled yet.</p>}
        {classes.map((c) => (
          <div key={c.id} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-medium">{c.title}</span>
              <span className="text-ink2 text-sm ml-2">
                · {c.subject} · {new Date(c.scheduledAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href={c.roomLink} target="_blank" rel="noopener noreferrer" className="text-glow text-sm hover:underline">
                Join ↗
              </a>
              {isFaculty && c.facultyId === user.id && (
                <button onClick={() => remove(c.id)} className="text-coral text-sm hover:underline">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
