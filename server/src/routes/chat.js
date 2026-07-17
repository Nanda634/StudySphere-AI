const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { callAI } = require("../utils/aiClient");
const { buildPrompt } = require("../utils/promptTemplates");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chat/sessions - list past chat sessions (most recent first), no message bodies
router.get("/sessions", requireAuth, async (req, res) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  res.json(sessions);
});

// GET /api/chat/sessions/:id - full message history for one session
router.get("/sessions/:id", requireAuth, async (req, res) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session || session.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

// POST /api/chat/sessions - start a new empty session
router.post("/sessions", requireAuth, async (req, res) => {
  const session = await prisma.chatSession.create({
    data: { userId: req.user.id, title: "New chat" },
  });
  res.json(session);
});

// DELETE /api/chat/sessions/:id
router.delete("/sessions/:id", requireAuth, async (req, res) => {
  const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
  if (!session || session.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await prisma.chatMessage.deleteMany({ where: { chatSessionId: session.id } });
  await prisma.chatSession.delete({ where: { id: session.id } });
  res.json({ success: true });
});

// POST /api/chat/sessions/:id/messages { text, language? } - send a message, get Goose's reply,
// persist both. Auto-titles the session from the first message.
router.post("/sessions/:id/messages", requireAuth, async (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
  if (!session || session.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  try {
    await prisma.chatMessage.create({
      data: { chatSessionId: session.id, role: "user", content: text },
    });

    const { system, user } = buildPrompt("chat", { text, language });
    const reply = await callAI({ system, user });

    await prisma.chatMessage.create({
      data: { chatSessionId: session.id, role: "ai", content: reply },
    });

    const updateData = { updatedAt: new Date() };
    if (session.title === "New chat") {
      updateData.title = text.slice(0, 60);
    }
    await prisma.chatSession.update({ where: { id: session.id }, data: updateData });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Goose couldn't reply. Try again." });
  }
});

module.exports = router;
