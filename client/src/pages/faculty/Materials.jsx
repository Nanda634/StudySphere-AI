import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ subject: "", title: "", type: "notes", content: "", url: "" });
  const [error, setError] = useState("");

  function load() {
    api.get("/faculty/materials").then((r) => setMaterials(r.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.subject || !form.title) return;
    try {
      await api.post("/faculty/materials", form);
      setForm({ subject: "", title: "", type: "notes", content: "", url: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save that material.");
    }
  }

  async function remove(id) {
    await api.delete(`/faculty/materials/${id}`);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Materials</h1>
      <p className="text-ink2 mb-6">Upload notes, reference materials, or links to recorded video classes.</p>

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
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 min-w-[140px] bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none"
          >
            <option value="notes">Notes (text)</option>
            <option value="material">Material (link)</option>
            <option value="video">Video class (link)</option>
          </select>
        </div>
        {form.type === "notes" ? (
          <textarea
            placeholder="Paste notes content here"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
        ) : (
          <input
            placeholder="URL (Drive link, YouTube link, etc.)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-glow"
          />
        )}
        <button className="bg-glow text-ink font-semibold px-5 py-2 rounded-lg hover:brightness-110">Add Material</button>
      </form>

      <div className="space-y-2">
        {materials.map((m) => (
          <div key={m.id} className="bg-panel rounded-xl px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-glow font-mono mr-2">{m.type}</span>
                <span className="font-medium">{m.title}</span>
                <span className="text-ink2 text-sm ml-2">· {m.subject}</span>
              </div>
              <button onClick={() => remove(m.id)} className="text-coral text-sm hover:underline">Remove</button>
            </div>
            {m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-teal text-sm hover:underline">
                {m.url}
              </a>
            )}
            {m.content && <p className="text-ink2 text-sm mt-1 whitespace-pre-wrap">{m.content}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
