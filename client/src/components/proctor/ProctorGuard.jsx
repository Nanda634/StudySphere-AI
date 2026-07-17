import React, { useCallback, useEffect, useRef, useState } from "react";

const MAX_VIOLATIONS = 3;

// Wraps a mock exam in real-exam-style proctoring:
//  - forces fullscreen for the duration of the exam
//  - requests camera + microphone access and shows a live self-view (like real online exams)
//  - flags tab switches, window blur, and exiting fullscreen as violations
//  - auto-submits the exam if violations pile up, same as most real proctoring software
//
// `onForceSubmit` is called (with no args) when violations hit the limit — the parent should
// treat that exactly like the student clicking "Submit".
export default function ProctorGuard({ active, onForceSubmit, children }) {
  const [phase, setPhase] = useState("setup"); // "setup" | "ready" | "denied" | "running"
  const [permError, setPermError] = useState("");
  const [violations, setViolations] = useState(0);
  const [lastWarning, setLastWarning] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  const flag = useCallback(
    (reason) => {
      setViolations((v) => {
        const next = v + 1;
        setLastWarning(reason);
        if (next >= MAX_VIOLATIONS) {
          onForceSubmit?.();
        }
        return next;
      });
    },
    [onForceSubmit]
  );

  async function requestAccess() {
    setPermError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPhase("ready");
    } catch (err) {
      setPermError(
        "Camera and microphone access is required to start this proctored exam. Please allow access and try again."
      );
      setPhase("denied");
    }
  }

  async function beginExam() {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Some browsers/contexts block fullscreen (e.g. iframes) — proceed anyway with
      // tab/visibility monitoring still active, rather than blocking the student entirely.
    }
    setPhase("running");
  }

  useEffect(() => {
    if (phase !== "running") return undefined;

    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        flag("You exited fullscreen mode.");
      }
    }
    function onVisibilityChange() {
      if (document.hidden) {
        flag("You switched away from this tab.");
      }
    }
    function onBlur() {
      flag("The exam window lost focus.");
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, flag]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!active) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  }, [active]);

  if (!active) return children;

  if (phase === "setup" || phase === "denied") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl mb-3">Proctored Exam Setup</h2>
        <p className="text-ink2 mb-6">
          This exam runs in full-screen mode with camera and microphone monitoring, like a real
          placement test. Leaving fullscreen, switching tabs, or losing camera access will be
          flagged — after {MAX_VIOLATIONS} flags the exam auto-submits.
        </p>
        {permError && <p className="text-coral text-sm mb-4">{permError}</p>}
        <button
          onClick={requestAccess}
          className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110"
        >
          Allow camera & microphone
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-ink min-h-[70vh]">
      {phase === "ready" && (
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <video ref={videoRef} autoPlay muted playsInline className="w-48 h-36 mx-auto rounded-lg mb-4 bg-black" />
          <p className="text-teal text-sm mb-6">Camera and microphone connected.</p>
          <button
            onClick={beginExam}
            className="bg-glow text-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110"
          >
            Enter fullscreen & start exam
          </button>
        </div>
      )}

      {phase === "running" && (
        <>
          <div className="fixed top-3 right-3 z-50 flex items-center gap-3">
            <video ref={videoRef} autoPlay muted playsInline className="w-28 h-20 rounded-lg border-2 border-coral/60 bg-black shadow-lamp" />
            <span
              className={`text-xs font-mono px-3 py-1.5 rounded-full ${
                violations > 0 ? "bg-coral/20 text-coral" : "bg-teal/20 text-teal"
              }`}
            >
              ⚠ {violations}/{MAX_VIOLATIONS} flags
            </span>
          </div>
          {lastWarning && violations > 0 && (
            <div className="fixed top-16 right-3 z-50 max-w-xs bg-coral/90 text-white text-xs px-3 py-2 rounded-lg">
              {lastWarning}
            </div>
          )}
          <div className="px-4 sm:px-6 py-6">{children}</div>
        </>
      )}
    </div>
  );
}
