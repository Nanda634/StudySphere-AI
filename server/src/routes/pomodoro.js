const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Log a completed focus session
router.post("/", requireAuth, async (req, res) => {
  const { focusMins, breakMins } = req.body;
  const session = await prisma.pomodoroSession.create({
    data: {
      userId: req.user.id,
      focusMins: focusMins || 25,
      breakMins: breakMins || 5,
    },
  });
  res.json(session);
});

// Stats: total sessions & focus minutes, plus today's count
router.get("/stats", requireAuth, async (req, res) => {
  const sessions = await prisma.pomodoroSession.findMany({ where: { userId: req.user.id } });
  const totalMins = sessions.reduce((sum, s) => sum + s.focusMins, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = sessions.filter((s) => s.completedAt >= todayStart).length;

  res.json({ totalSessions: sessions.length, totalFocusMinutes: totalMins, todaySessions: todayCount });
});

module.exports = router;
