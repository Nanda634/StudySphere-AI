const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { callAIJson } = require("../utils/aiClient");
const { buildPrompt } = require("../utils/promptTemplates");

const router = express.Router();
const prisma = new PrismaClient();

const COIN_RULES = {
  easy: { min: 2, max: 5 },
  moderate: { min: 10, max: 15 },
  advanced: { min: 20, max: 25 },
};
function coinsForScore(score) {
  if (score >= 80) return COIN_RULES.advanced.min + Math.round((COIN_RULES.advanced.max - COIN_RULES.advanced.min) * (score - 80) / 20);
  if (score >= 50) return COIN_RULES.moderate.min + Math.round((COIN_RULES.moderate.max - COIN_RULES.moderate.min) * (score - 50) / 30);
  return COIN_RULES.easy.min;
}

function jsonErrorHandler(res, err, fallback) {
  console.error(err);
  res.status(502).json({ error: err.message || fallback });
}

// POST /api/courses/tutorial { topic, examTarget? } - cached per user/topic
router.post("/tutorial", requireAuth, async (req, res) => {
  const { topic, examTarget } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required" });

  try {
    const cached = await prisma.studySession.findFirst({
      where: { userId: req.user.id, type: "tutorial", topic },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      return res.json({ result: JSON.parse(cached.content), cached: true });
    }

    const { system, user } = buildPrompt("tutorial", { topic, examTarget });
    const result = await callAIJson({ system, user }, {
      onRetry: () => console.warn("Retrying tutorial generation for topic:", topic),
    });

    await prisma.studySession.create({
      data: { userId: req.user.id, type: "tutorial", topic, content: JSON.stringify(result) },
    });

    res.json({ result, cached: false });
  } catch (err) {
    jsonErrorHandler(res, err, "Goose couldn't generate that lesson. Try again.");
  }
});

// POST /api/courses/syllabus { topic } - full chapter list for a course, cached per user/topic.
// The client shows this as the chapter sidebar, then loads each chapter's content lazily by
// calling /tutorial with a compound topic like "Java: Loops (for, while, do-while)".
router.post("/syllabus", requireAuth, async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required" });

  try {
    const cached = await prisma.studySession.findFirst({
      where: { userId: req.user.id, type: "syllabus", topic },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      return res.json({ result: JSON.parse(cached.content), cached: true });
    }

    const { system, user } = buildPrompt("syllabus", { topic });
    const result = await callAIJson({ system, user }, {
      onRetry: () => console.warn("Retrying syllabus generation for topic:", topic),
    });

    await prisma.studySession.create({
      data: { userId: req.user.id, type: "syllabus", topic, content: JSON.stringify(result) },
    });

    res.json({ result, cached: false });
  } catch (err) {
    jsonErrorHandler(res, err, "Goose couldn't generate the course outline. Try again.");
  }
});

// POST /api/courses/coding-problems { topic, language, difficulty, count }
router.post("/coding-problems", requireAuth, async (req, res) => {
  const { topic, language, difficulty, count } = req.body;
  if (!topic || !language) return res.status(400).json({ error: "topic and language are required" });

  try {
    const { system, user } = buildPrompt("coding_problem", { topic, language, difficulty, count: count || 3 });
    const result = await callAIJson({ system, user }, {
      onRetry: () => console.warn("Retrying coding problem generation for topic:", topic),
    });
    res.json({ result });
  } catch (err) {
    jsonErrorHandler(res, err, "Goose couldn't generate coding problems. Try again.");
  }
});

// POST /api/courses/coding-review { topic, language, code } - AI-reviewed, not executed.
router.post("/coding-review", requireAuth, async (req, res) => {
  const { topic, language, code } = req.body;
  if (!topic || !language || !code) {
    return res.status(400).json({ error: "topic, language, and code are required" });
  }

  try {
    const { system, user } = buildPrompt("coding_review", { topic, language, text: code });
    const review = await callAIJson({ system, user }, {
      onRetry: () => console.warn("Retrying code review for topic:", topic),
    });

    const coinsEarned = coinsForScore(review.score || 0);

    const attempt = await prisma.codingAttempt.create({
      data: {
        userId: req.user.id,
        topic,
        language,
        problem: topic,
        code,
        score: review.score || 0,
        aiFeedback: review.feedback || "",
        coinsEarned,
      },
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { coins: { increment: coinsEarned } } });
    await prisma.coinTransaction.create({
      data: { userId: req.user.id, amount: coinsEarned, reason: `Coding assessment: ${topic} (${language})` },
    });

    res.json({ ...review, coinsEarned, attemptId: attempt.id });
  } catch (err) {
    jsonErrorHandler(res, err, "Goose couldn't review that code. Try again.");
  }
});

// GET /api/courses/coding-history - past coding attempts for the logged-in student
router.get("/coding-history", requireAuth, async (req, res) => {
  const attempts = await prisma.codingAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(attempts);
});

module.exports = router;
