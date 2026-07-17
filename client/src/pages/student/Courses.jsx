import React, { useEffect, useState } from "react";
import { CATALOG, SECTORS, youtubeSearchUrl, languageForTopic } from "../../data/courseCatalog";
import api from "../../services/api";
import W3TryIt from "../../components/courses/W3TryIt";
import "../../styles/w3schools.css";

// A full W3Schools-style tutorial reader. Picking a course (e.g. "Java") first loads its full
// chapter list from Goose (Introduction, Data Types, Loops, OOP, ...) — same as a real course's
// table of contents — shown as the left sidebar. Picking a chapter loads that chapter's own
// focused lesson, quiz, and (for programming topics) a "Try it Yourself" editor. The bottom
// pager pages through chapters within the current course, exactly like w3schools.com.
export default function Courses() {
  const [sector, setSector] = useState(SECTORS[0]);
  const [course, setCourse] = useState(CATALOG[SECTORS[0]].topics[0]);

  const [chapters, setChapters] = useState(null); // string[]
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);

  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("lesson"); // "lesson" | "quiz"
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const sectorData = CATALOG[sector];
  const language = languageForTopic(sector, course);
  const chapterTitle = chapters?.[chapterIndex];
  // Compound topic like "Java: Loops (for, while, do-while)" — gives Goose the language/subject
  // context for the chapter so the lesson stays focused instead of re-explaining the basics.
  const compoundTopic = chapterTitle ? `${course}: ${chapterTitle}` : course;

  useEffect(() => {
    loadChapters(course);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, sector]);

  useEffect(() => {
    if (!chapterTitle) return;
    loadLesson(compoundTopic);
    setTab("lesson");
    setQuiz(null);
    setAnswers({});
    setQuizResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterTitle]);

  async function loadChapters(courseName) {
    setError("");
    setChapters(null);
    setLesson(null);
    setChapterIndex(0);
    setChaptersLoading(true);
    try {
      const { data } = await api.post("/courses/syllabus", { topic: courseName });
      setChapters(data.result.chapters || []);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't build the course outline.");
    } finally {
      setChaptersLoading(false);
    }
  }

  async function loadLesson(t) {
    setError("");
    setLesson(null);
    setLessonLoading(true);
    try {
      const { data } = await api.post("/courses/tutorial", { topic: t });
      setLesson(data.result);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't load that lesson.");
    } finally {
      setLessonLoading(false);
    }
  }

  async function openQuizTab() {
    setTab("quiz");
    if (quiz) return;
    setError("");
    setQuizLoading(true);
    try {
      const { data } = await api.post("/ai/generate", { mode: "quiz", topic: compoundTopic, difficulty: "intermediate", count: 8 });
      setQuiz(data.result.questions);
    } catch (err) {
      setError(err.response?.data?.error || "Goose couldn't generate a quiz for this chapter.");
    } finally {
      setQuizLoading(false);
    }
  }

  async function submitQuiz() {
    try {
      const { data } = await api.post("/ai/quiz/submit", { topic: compoundTopic, difficulty: "intermediate", questions: quiz, answers });
      setQuizResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't submit your quiz.");
    }
  }

  function selectSector(s) {
    setSector(s);
    setCourse(CATALOG[s].topics[0]);
  }

  function goChapterOffset(offset) {
    const nextIdx = chapterIndex + offset;
    if (chapters && nextIdx >= 0 && nextIdx < chapters.length) {
      setChapterIndex(nextIdx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl mb-1 text-paper">Courses</h1>
      <p className="text-ink2 mb-6">Core subjects by sector, presented as a full W3Schools-style tutorial course.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => selectSector(s)}
            className={`px-4 py-2 rounded-full text-sm border ${
              sector === s ? "bg-glow/20 border-glow text-glow" : "border-white/10 text-ink2 hover:bg-panel"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {sectorData.topics.map((t) => (
          <button
            key={t}
            onClick={() => setCourse(t)}
            className={`px-3.5 py-1.5 rounded-lg text-sm border ${
              course === t ? "bg-teal/15 border-teal text-teal" : "border-white/10 text-ink2 hover:bg-panel"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="w3-tut">
        <div className="w3-topbar">
          <span className="w3-brand">Study<span>Sphere</span> Tutorials</span>
          <a
            href={youtubeSearchUrl(`${course}${chapterTitle ? " " + chapterTitle : ""} tutorial`)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", fontSize: 13, textDecoration: "none" }}
          >
            ▶ Watch on YouTube
          </a>
        </div>

        <div className="w3-shell">
          <nav className="w3-sidenav">
            <div className="w3-sidenav-title">{course} — Chapters</div>
            {chaptersLoading && <div className="w3-loading" style={{ padding: "20px 20px" }}>Building course outline…</div>}
            {chapters?.map((c, i) => (
              <button key={c} className={chapterIndex === i ? "active" : ""} onClick={() => setChapterIndex(i)}>
                {i + 1}. {c}
              </button>
            ))}
          </nav>

          <div className="w3-content">
            <div className="w3-crumb">
              <a onClick={() => selectSector(sector)}>{sector}</a> » <a onClick={() => loadChapters(course)}>{course}</a>
              {chapterTitle ? ` » ${chapterTitle}` : ""}
            </div>
            <h1 className="w3-chapter-title">{chapterTitle || course}</h1>

            {chapterTitle && (
              <div className="w3-tabbar">
                <button className={tab === "lesson" ? "active" : ""} onClick={() => setTab("lesson")}>Tutorial</button>
                <button className={tab === "quiz" ? "active" : ""} onClick={openQuizTab}>Quiz Yourself</button>
              </div>
            )}

            {error && <p style={{ color: "#c0392b", marginTop: 14 }}>{error}</p>}

            {tab === "lesson" && (
              <>
                {lessonLoading && <div className="w3-loading">Goose is preparing this chapter…</div>}
                {lesson && (
                  <>
                    <p className="w3-lead">{lesson.intro}</p>

                    {lesson.sections?.map((s, i) => (
                      <div key={i}>
                        <h2 className="w3-h2">{i + 1}. {s.heading}</h2>
                        <p className="w3-body-text">{s.content}</p>
                      </div>
                    ))}

                    {lesson.keyPoints?.length > 0 && (
                      <div className="w3-keypoints">
                        <h3>✔ Key Points</h3>
                        <ul>
                          {lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
                        </ul>
                      </div>
                    )}

                    {lesson.isProgramming && lesson.codeExample?.code && (
                      <>
                        <h2 className="w3-h2">Example</h2>
                        <p className="w3-body-text">{lesson.codeExample.explanation}</p>
                        <W3TryIt
                          topic={compoundTopic}
                          initialLanguage={lesson.codeExample.language || language || "javascript"}
                          initialCode={lesson.codeExample.code}
                        />
                      </>
                    )}

                    {sectorData.isProgramming && (
                      <>
                        <h2 className="w3-h2">Practice Editor</h2>
                        <p className="w3-body-text">Write and test your own {language} code on this chapter's topic.</p>
                        <W3TryIt topic={compoundTopic} initialLanguage={language || "javascript"} initialCode="" />
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {tab === "quiz" && (
              <div style={{ paddingBottom: 20 }}>
                {quizLoading && <div className="w3-loading">Goose is writing your quiz…</div>}
                {quiz && !quizResult && (
                  <>
                    {quiz.map((q, i) => (
                      <div key={i} style={{ marginBottom: 18 }}>
                        <p style={{ fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q.question}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {Object.entries(q.options).map(([key, val]) => (
                            <button
                              key={key}
                              onClick={() => setAnswers((a) => ({ ...a, [i]: key }))}
                              style={{
                                textAlign: "left",
                                padding: "8px 12px",
                                borderRadius: 6,
                                border: answers[i] === key ? "2px solid #04aa6d" : "1px solid #ccc",
                                background: answers[i] === key ? "#e8fbf3" : "#fff",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                            >
                              <strong>{key}.</strong> {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className="w3-runbtn"
                      onClick={submitQuiz}
                      disabled={Object.keys(answers).length < quiz.length}
                    >
                      Submit Quiz
                    </button>
                  </>
                )}
                {quizResult && (
                  <div>
                    <h2 className="w3-h2">Score: {quizResult.score}/{quizResult.total}</h2>
                    {quizResult.aiFeedback && <p className="w3-body-text">{quizResult.aiFeedback}</p>}
                    {quizResult.details?.map((d, i) => (
                      <p key={i} style={{ fontSize: 14, color: d.correct ? "#04aa6d" : "#c0392b" }}>
                        {i + 1}. {d.question} — you chose {d.chosen || "nothing"}, correct is {d.correctOption}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w3-pager">
          <button disabled={chapterIndex <= 0} onClick={() => goChapterOffset(-1)}>
            ❮ Previous{chapters && chapterIndex > 0 ? `: ${chapters[chapterIndex - 1]}` : ""}
          </button>
          <button disabled={!chapters || chapterIndex >= chapters.length - 1} onClick={() => goChapterOffset(1)}>
            Next{chapters && chapterIndex < chapters.length - 1 ? `: ${chapters[chapterIndex + 1]}` : ""} ❯
          </button>
        </div>
        <div className="w3-footer-note">AI-generated tutorial content by Goose · StudySphere AI</div>
      </div>
    </div>
  );
}
