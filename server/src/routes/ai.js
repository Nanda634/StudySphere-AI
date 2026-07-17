const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { callAI, callAIJson } = require("../utils/aiClient");
const { buildPrompt } = require("../utils/promptTemplates");

const router = express.Router();
const prisma = new PrismaClient();

const JSON_MODES = ["explain", "notes", "flashcards", "mcq", "quiz", "exam_paper"];
const SAVED_TYPES = ["explain", "notes", "flashcards", "mcq", "quiz", "exam_paper"];

const COIN_RULES = {
  easy: { min: 2, max: 5 },
  beginner: { min: 2, max: 5 },
  intermediate: { min: 10, max: 15 },
  moderate: { min: 10, max: 15 },
  advanced: { min: 20, max: 25 },
  hard: { min: 20, max: 25 },
};

function coinsForDifficulty(difficulty, scoreRatio) {
  const rule = COIN_RULES[(difficulty || "beginner").toLowerCase()] || COIN_RULES.beginner;
  const span = rule.max - rule.min;
  return Math.round(rule.min + span * Math.max(0, Math.min(1, scoreRatio)));
}

// POST /api/ai/generate  { mode, topic?, text?, difficulty?, count?, examTarget?, language?, marksScheme?, totalMarks?, examType? }
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { mode, topic, text, difficulty, count, examTarget, language, marksScheme, totalMarks, examType } = req.body;

    if (!mode) return res.status(400).json({ error: "mode is required" });
    if (!["chat", "mock_exam"].includes(mode) && !topic && !text) {
      return res.status(400).json({ error: "topic or text is required for this mode" });
    }

    const { system, user } = buildPrompt(mode, {
      topic, text, difficulty, count, examTarget, language, marksScheme, totalMarks, examType,
    });

    let result;
    if (JSON_MODES.includes(mode) || mode === "mock_exam") {
      try {
        result = await callAIJson({ system, user }, {
          onRetry: () => console.warn("Retrying generation after JSON parse failure for mode:", mode),
        });
      } catch (err) {
        console.error("Goose returned non-JSON after retry for mode:", mode, err.rawResponse?.slice(0, 300));
        return res.status(502).json({ error: err.message });
      }
    } else {
      const raw = await callAI({ system, user });
      result = { reply: raw };
    }

    if (SAVED_TYPES.includes(mode)) {
      await prisma.studySession.create({
        data: {
          userId: req.user.id,
          type: mode,
          topic: topic || "Uploaded document",
          examTarget: examTarget || null,
          difficulty: difficulty || null,
          content: JSON.stringify(result),
        },
      });
    }

    res.json({ mode, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Goose ran into a problem generating that. Please try again." });
  }
});

// GET /api/ai/history - list saved study sessions for the logged-in student
router.get("/history", requireAuth, async (req, res) => {
  const items = await prisma.studySession.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(items.map((i) => ({ ...i, content: JSON.parse(i.content) })));
});

// PATCH /api/ai/history/:id/bookmark - toggle bookmark
router.patch("/history/:id/bookmark", requireAuth, async (req, res) => {
  const item = await prisma.studySession.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ error: "Not found" });
  }
  const updated = await prisma.studySession.update({
    where: { id: item.id },
    data: { bookmarked: !item.bookmarked },
  });
  res.json(updated);
});

// POST /api/ai/quiz/submit - grade a quiz/mock-exam attempt, award coins, generate AI feedback
router.post("/quiz/submit", requireAuth, async (req, res) => {
  const { topic, difficulty, questions, answers, examType, assignmentId, language } = req.body;

  let score = 0;
  const details = questions.map((q, idx) => {
    const chosen = answers[idx];
    const correct = chosen === q.correctOption;
    if (correct) score += 1;
    return { question: q.question, chosen, correctOption: q.correctOption, correct };
  });

  const scoreRatio = questions.length ? score / questions.length : 0;
  const coinsEarned = coinsForDifficulty(difficulty, scoreRatio);

  // Ask Goose for specific, personalized feedback rather than a generic template.
  // This is a plain-text mode (not JSON), so a slow/failed call here should never block
  // the score itself from being saved and returned.
  let aiFeedback = null;
  try {
    const wrongQuestions = details.filter((d) => !d.correct).map((d) => d.question);
    const { system, user } = buildPrompt("quiz_feedback", {
      topic: topic || examType || "this topic",
      quizResults: { score, total: questions.length, wrongQuestions },
      language,
    });
    aiFeedback = await callAI({ system, user });
  } catch (feedbackErr) {
    console.warn("Couldn't generate AI feedback, continuing without it:", feedbackErr.message);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: req.user.id,
      topic: topic || examType || "General",
      difficulty: difficulty || "beginner",
      examType: examType || null,
      assignmentId: assignmentId || null,
      score,
      total: questions.length,
      coinsEarned,
      aiFeedback,
      details: JSON.stringify(details),
    },
  });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { coins: { increment: coinsEarned } },
  });
  await prisma.coinTransaction.create({
    data: {
      userId: req.user.id,
      amount: coinsEarned,
      reason: `Quiz completed: ${topic || examType || "General"} (${difficulty || "beginner"})`,
    },
  });

  res.json({
    score,
    total: questions.length,
    details,
    aiFeedback,
    coinsEarned,
    attemptId: attempt.id,
  });
});

// GET /api/ai/quiz/history - past quiz/exam attempts for the logged-in student
router.get("/quiz/history", requireAuth, async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(attempts);
});

module.exports = router;
