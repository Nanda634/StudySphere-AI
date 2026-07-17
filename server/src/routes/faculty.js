const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireFaculty } = require("../middleware/auth");
const { callAIJson } = require("../utils/aiClient");
const { buildPrompt } = require("../utils/promptTemplates");

const router = express.Router();
const prisma = new PrismaClient();

// ---------- Materials (notes / files / video links) ----------

router.get("/materials", requireAuth, requireFaculty, async (req, res) => {
  const materials = await prisma.material.findMany({
    where: { facultyId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(materials);
});

router.post("/materials", requireAuth, requireFaculty, async (req, res) => {
  const { subject, title, type, content, url } = req.body;
  if (!subject || !title || !type) {
    return res.status(400).json({ error: "subject, title, and type are required" });
  }
  const material = await prisma.material.create({
    data: { facultyId: req.user.id, subject, title, type, content: content || null, url: url || null },
  });
  res.json(material);
});

router.delete("/materials/:id", requireAuth, requireFaculty, async (req, res) => {
  const material = await prisma.material.findUnique({ where: { id: req.params.id } });
  if (!material || material.facultyId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await prisma.material.delete({ where: { id: material.id } });
  res.json({ success: true });
});

// ---------- Assignments (faculty-created quizzes, AI-generated) ----------

router.get("/assignments", requireAuth, requireFaculty, async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { facultyId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(assignments.map((a) => ({ ...a, quizContent: JSON.parse(a.quizContent) })));
});

// Generates the quiz via Goose, then saves it as an assignment students can attempt.
router.post("/assignments/generate", requireAuth, requireFaculty, async (req, res) => {
  const { subject, title, topic, difficulty, count, dueDate } = req.body;
  if (!subject || !title || !topic) {
    return res.status(400).json({ error: "subject, title, and topic are required" });
  }
  try {
    const { system, user } = buildPrompt("quiz", { topic, difficulty, count: count || 10 });
    const quizContent = await callAIJson({ system, user }, {
      onRetry: () => console.warn("Retrying assignment generation for topic:", topic),
    });

    const assignment = await prisma.assignment.create({
      data: {
        facultyId: req.user.id,
        subject,
        title,
        difficulty: difficulty || "intermediate",
        quizContent: JSON.stringify(quizContent),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.json({ ...assignment, quizContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Goose couldn't generate that assignment. Try again." });
  }
});

router.delete("/assignments/:id", requireAuth, requireFaculty, async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment || assignment.facultyId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await prisma.assignment.delete({ where: { id: assignment.id } });
  res.json({ success: true });
});

// Students fetch an assignment to attempt it (any logged-in student, not just a specific class —
// simple "assign to everyone" model for this MVP).
router.get("/assignments/:id/attempt", requireAuth, async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) return res.status(404).json({ error: "Not found" });
  res.json({ ...assignment, quizContent: JSON.parse(assignment.quizContent) });
});

router.get("/assignments/public/list", requireAuth, async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, subject: true, title: true, difficulty: true, dueDate: true, createdAt: true, facultyId: true },
  });
  res.json(assignments);
});

// ---------- Live classes ----------

router.get("/live-classes", requireAuth, async (req, res) => {
  // Visible to everyone (students need to see faculty's scheduled classes)
  const classes = await prisma.liveClass.findMany({ orderBy: { scheduledAt: "asc" } });
  res.json(classes);
});

router.post("/live-classes", requireAuth, requireFaculty, async (req, res) => {
  const { title, subject, roomLink, scheduledAt } = req.body;
  if (!title || !subject || !roomLink || !scheduledAt) {
    return res.status(400).json({ error: "title, subject, roomLink, and scheduledAt are required" });
  }
  const liveClass = await prisma.liveClass.create({
    data: { facultyId: req.user.id, title, subject, roomLink, scheduledAt: new Date(scheduledAt) },
  });
  res.json(liveClass);
});

router.delete("/live-classes/:id", requireAuth, requireFaculty, async (req, res) => {
  const liveClass = await prisma.liveClass.findUnique({ where: { id: req.params.id } });
  if (!liveClass || liveClass.facultyId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await prisma.liveClass.delete({ where: { id: liveClass.id } });
  res.json({ success: true });
});

// ---------- Analytics ----------

// Aggregate quiz/assignment performance across all students, grouped by topic.
// Simple platform-wide view for this MVP rather than per-class rosters.
router.get("/analytics", requireAuth, requireFaculty, async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true } } },
  });

  const byTopic = {};
  for (const a of attempts) {
    const key = a.topic;
    if (!byTopic[key]) byTopic[key] = { topic: key, attempts: 0, totalScore: 0, totalPossible: 0 };
    byTopic[key].attempts += 1;
    byTopic[key].totalScore += a.score;
    byTopic[key].totalPossible += a.total;
  }
  const topicSummary = Object.values(byTopic).map((t) => ({
    ...t,
    averagePercent: t.totalPossible ? Number(((t.totalScore / t.totalPossible) * 100).toFixed(1)) : 0,
  }));

  res.json({
    recentAttempts: attempts.slice(0, 20).map((a) => ({
      studentName: a.user.name,
      topic: a.topic,
      score: a.score,
      total: a.total,
      createdAt: a.createdAt,
    })),
    topicSummary,
  });
});

module.exports = router;
