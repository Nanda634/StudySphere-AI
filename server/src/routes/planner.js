const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (req, res) => {
  const tasks = await prisma.plannerTask.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "asc" },
  });
  res.json(tasks);
});

router.post("/", requireAuth, async (req, res) => {
  const { title, subject, date } = req.body;
  if (!title || !date) return res.status(400).json({ error: "title and date are required" });

  const task = await prisma.plannerTask.create({
    data: { userId: req.user.id, title, subject, date: new Date(date) },
  });
  res.json(task);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const task = await prisma.plannerTask.findUnique({ where: { id: req.params.id } });
  if (!task || task.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.plannerTask.update({
    where: { id: task.id },
    data: { done: req.body.done ?? task.done, title: req.body.title ?? task.title },
  });
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const task = await prisma.plannerTask.findUnique({ where: { id: req.params.id } });
  if (!task || task.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  await prisma.plannerTask.delete({ where: { id: task.id } });
  res.json({ success: true });
});

module.exports = router;
