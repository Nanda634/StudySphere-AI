import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";

const FOCUS_MINS = 25;
const BREAK_MINS = 5;

export default function Pomodoro() {
  const [phase, setPhase] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINS * 60);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ totalSessions: 0, totalFocusMinutes: 0, todaySessions: 0 });
  const intervalRef = useRef(null);

  function loadStats() {
    api.get("/pomodoro/stats").then((r) => setStats(r.data));
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handlePhaseEnd();
            return phase === "focus" ? BREAK_MINS * 60 : FOCUS_MINS * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  async function handlePhaseEnd() {
    if (phase === "focus") {
      await api.post("/pomodoro", { focusMins: FOCUS_MINS, breakMins: BREAK_MINS });
      loadStats();
      setPhase("break");
    } else {
      setPhase("focus");
    }
  }

  function toggle() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS_MINS * 60);
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-center">
      <h1 className="font-display text-3xl mb-1">Pomodoro Timer</h1>
      <p className="text-ink2 mb-10">25 minutes of focus, 5 minutes of break. Repeat.</p>

      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 rounded-full bg-glow/20 blur-3xl" />
        <div className="relative w-64 h-64 rounded-full border-4 border-glow/30 flex flex-col items-center justify-center bg-panel">
          <p className="text-xs uppercase tracking-widest text-ink2 mb-2">{phase === "focus" ? "Focus" : "Break"}</p>
          <p className="font-mono text-5xl text-glow">{mins}:{secs}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-12">
        <button onClick={toggle} className="bg-glow text-ink font-semibold px-8 py-3 rounded-full hover:brightness-110">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="px-8 py-3 rounded-full border border-white/10 hover:bg-panel">
          Reset
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Today's sessions" value={stats.todaySessions} />
        <StatCard label="Total sessions" value={stats.totalSessions} />
        <StatCard label="Total focus minutes" value={stats.totalFocusMinutes} />
      </div>
    </div>
  );
}
