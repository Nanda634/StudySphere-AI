const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const { callVision } = require("../utils/aiClient");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/vision/analyze (multipart/form-data, field "image", optional field "question")
// Analyzed by Gemini, which supports images natively.
router.post("/analyze", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const base64 = req.file.buffer.toString("base64");
    const question = req.body.question || "Describe this image and explain anything academically relevant in it.";

    const reply = await callVision({ prompt: question, imageBase64: base64, mimeType: req.file.mimetype });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Goose couldn't analyze that image.",
    });
  }
});

module.exports = router;
