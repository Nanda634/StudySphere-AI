const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { callAIJson } = require("../utils/aiClient");
const { buildPrompt } = require("../utils/promptTemplates");

const router = express.Router();
const prisma = new PrismaClient();

// Static catalog of real-world exams students can unlock with coins. Every generated test
// is clearly an AI-generated practice set in the style of the exam — never real/leaked content.
const CATALOG = [
  { key: "tcs-nqt", name: "TCS NQT", category: "IT Placement", cost: 15, blurb: "Aptitude + verbal + coding, in the style of TCS's National Qualifier Test.", hasCoding: true, codingLanguage: "java", codingCount: 2, durationMins: 60 },
  { key: "accenture", name: "Accenture", category: "IT Placement", cost: 15, blurb: "Cognitive, technical, and coding practice in Accenture's typical format.", hasCoding: true, codingLanguage: "java", codingCount: 2, durationMins: 60 },
  { key: "cognizant", name: "Cognizant GenC", category: "IT Placement", cost: 15, blurb: "Aptitude and programming practice in Cognizant's typical format.", hasCoding: true, codingLanguage: "python", codingCount: 2, durationMins: 60 },
  { key: "amazon-sde", name: "Amazon SDE", category: "IT Placement", cost: 25, blurb: "DSA-focused coding and problem-solving, in Amazon's typical interview style.", hasCoding: true, codingLanguage: "cpp", codingCount: 2, durationMins: 60 },
  { key: "google-swe", name: "Google SWE", category: "IT Placement", cost: 25, blurb: "Algorithmic problem-solving practice, in Google's typical interview style.", hasCoding: true, codingLanguage: "cpp", codingCount: 2, durationMins: 60 },
  { key: "jee-main", name: "JEE Main", category: "Engineering Entrance", cost: 20, blurb: "Physics, Chemistry, Maths practice questions at JEE Main difficulty." },
  { key: "jee-advanced", name: "JEE Advanced", category: "Engineering Entrance", cost: 25, blurb: "Higher-difficulty PCM practice questions at JEE Advanced level." },
  { key: "neet", name: "NEET", category: "Medical Entrance", cost: 20, blurb: "Physics, Chemistry, Biology practice questions at NEET difficulty." },
  { key: "gate", name: "GATE", category: "PG Engineering Entrance", cost: 20, blurb: "Core engineering + aptitude practice questions at GATE difficulty." },
  { key: "cat", name: "CAT", category: "Management Entrance", cost: 20, blurb: "Quant, verbal, and logical reasoning practice at CAT difficulty." },
  { key: "sat", name: "SAT", category: "US Undergrad Entrance", cost: 20, blurb: "Reading, writing, and math practice questions at SAT difficulty." },
];

// GET /api/mockexams/catalog - list available exams and their coin cost
router.get("/catalog", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { coins: true, freeMockExamUsed: true } });
  res.json({ balance: user?.coins || 0, freeExamAvailable: !user?.freeMockExamUsed, exams: CATALOG });
});

// POST /api/mockexams/:key/generate - spend coins (or use the one free exam), generate an AI mock test
router.post("/:key/generate", requireAuth, async (req, res) => {
  const exam = CATALOG.find((e) => e.key === req.params.key);
  if (!exam) return res.status(404).json({ error: "Unknown exam" });

  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { coins: true, freeMockExamUsed: true } });
  const usingFreeExam = !user?.freeMockExamUsed;

  if (!usingFreeExam && (user?.coins || 0) < exam.cost) {
    return res.status(402).json({ error: `Not enough coins. This exam costs ${exam.cost}, you have ${user?.coins || 0}.` });
  }

  try {
    // IT-placement exams also generate a coding round, so keep the MCQ count a bit smaller by
    // default for those — 15 MCQs *and* 2 coding problems in one exam is a lot of JSON to
    // generate reliably in one go. Still fully overridable via req.body.count.
    const mcqCount = req.body.count || (exam.hasCoding ? 10 : 15);
    const { system, user: userPrompt } = buildPrompt("mock_exam", { examType: exam.name, count: mcqCount });
    const result = await callAIJson({ system, user: userPrompt }, {
      onRetry: (attempt) => console.warn(`Retrying mock exam generation for ${exam.name} (attempt ${attempt})`),
    });

    // IT-placement exams (TCS, Accenture, Cognizant, Amazon, Google) run as a real two-round
    // test: an MCQ/aptitude round followed by a coding round, same as the actual company exams.
    // If the coding round fails to generate (e.g. the local model returns malformed JSON), don't
    // throw away the whole exam — fall back to an MCQ-only exam instead of a hard error.
    let codingRound = null;
    if (exam.hasCoding) {
      try {
        const { system: codeSystem, user: codeUserPrompt } = buildPrompt("coding_problem", {
          topic: `${exam.name} placement exam`,
          language: exam.codingLanguage || "java",
          difficulty: "intermediate",
          count: exam.codingCount || 2,
        });
        const codingResult = await callAIJson({ system: codeSystem, user: codeUserPrompt }, {
          onRetry: (attempt) => console.warn(`Retrying coding round generation for ${exam.name} (attempt ${attempt})`),
        });
        codingRound = { language: exam.codingLanguage || "java", problems: codingResult.problems || [] };
      } catch (codingErr) {
        console.warn(`Coding round generation failed for ${exam.name}, continuing with MCQ-only exam:`, codingErr.message);
        codingRound = null;
      }
    }

    if (usingFreeExam) {
      await prisma.user.update({ where: { id: req.user.id }, data: { freeMockExamUsed: true } });
      await prisma.coinTransaction.create({
        data: { userId: req.user.id, amount: 0, reason: `Free mock exam used: ${exam.name}` },
      });
    } else {
      await prisma.user.update({ where: { id: req.user.id }, data: { coins: { decrement: exam.cost } } });
      await prisma.coinTransaction.create({
        data: { userId: req.user.id, amount: -exam.cost, reason: `Unlocked ${exam.name} mock exam` },
      });
    }

    res.json({ exam, result, codingRound, wasFree: usingFreeExam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Goose couldn't generate that mock exam. Nothing was spent — try again." });
  }
});

module.exports = router;
