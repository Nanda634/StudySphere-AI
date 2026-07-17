const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (req, res) => {
  const records = await prisma.cgpaRecord.findMany({
    where: { userId: req.user.id },
    orderBy: { semester: "asc" },
  });
  res.json(records);
});

// Add/update a semester's SGPA + credits
router.post("/", requireAuth, async (req, res) => {
  const { semester, sgpa, credits } = req.body;
  if (semester == null || sgpa == null || credits == null) {
    return res.status(400).json({ error: "semester, sgpa, and credits are required" });
  }

  const record = await prisma.cgpaRecord.create({
    data: { userId: req.user.id, semester, sgpa, credits },
  });
  res.json(record);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const record = await prisma.cgpaRecord.findUnique({ where: { id: req.params.id } });
  if (!record || record.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  await prisma.cgpaRecord.delete({ where: { id: record.id } });
  res.json({ success: true });
});

// Computes weighted CGPA across all recorded semesters, plus what's needed for a target CGPA
router.post("/predict", requireAuth, async (req, res) => {
  const { targetCgpa, futureCredits } = req.body;
  const records = await prisma.cgpaRecord.findMany({ where: { userId: req.user.id } });

  const totalCredits = records.reduce((s, r) => s + r.credits, 0);
  const totalPoints = records.reduce((s, r) => s + r.sgpa * r.credits, 0);
  const currentCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  let requiredFutureSgpa = null;
  if (targetCgpa && futureCredits) {
    const neededPoints = targetCgpa * (totalCredits + futureCredits) - totalPoints;
    requiredFutureSgpa = neededPoints / futureCredits;
  }

  res.json({
    currentCgpa: Number(currentCgpa.toFixed(2)),
    totalCredits,
    requiredFutureSgpa: requiredFutureSgpa != null ? Number(requiredFutureSgpa.toFixed(2)) : null,
  });
});

module.exports = router;
