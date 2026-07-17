const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (req, res) => {
  const records = await prisma.attendanceRecord.findMany({ where: { userId: req.user.id } });
  const withPercent = records.map((r) => ({
    ...r,
    percentage: r.total > 0 ? Number(((r.attended / r.total) * 100).toFixed(1)) : 0,
  }));
  res.json(withPercent);
});

// Create or update attendance for a subject
router.post("/", requireAuth, async (req, res) => {
  const { subject, attended, total } = req.body;
  if (!subject || attended == null || total == null) {
    return res.status(400).json({ error: "subject, attended, and total are required" });
  }

  const existing = await prisma.attendanceRecord.findFirst({
    where: { userId: req.user.id, subject },
  });

  const record = existing
    ? await prisma.attendanceRecord.update({ where: { id: existing.id }, data: { attended, total } })
    : await prisma.attendanceRecord.create({ data: { userId: req.user.id, subject, attended, total } });

  res.json(record);
});

// How many more classes needed to hit a required percentage (assuming all future classes attended)
router.get("/:subject/required/:targetPercent", requireAuth, async (req, res) => {
  const { subject, targetPercent } = req.params;
  const record = await prisma.attendanceRecord.findFirst({ where: { userId: req.user.id, subject } });
  if (!record) return res.status(404).json({ error: "No attendance record for this subject" });

  const target = Number(targetPercent) / 100;
  const { attended, total } = record;

  let classesNeeded = 0;
  let a = attended, t = total;
  while (t > 0 && a / t < target) {
    a += 1;
    t += 1;
    classesNeeded += 1;
    if (classesNeeded > 1000) break; // safety guard
  }

  res.json({ subject, currentPercentage: Number(((attended / total) * 100).toFixed(1)), classesNeeded });
});

module.exports = router;
