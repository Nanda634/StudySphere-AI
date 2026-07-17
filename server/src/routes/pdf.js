const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// POST /api/pdf/extract  (multipart/form-data, field name "file")
// Returns extracted text. Frontend then calls /api/ai/generate with { mode, text }.
router.post("/extract", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await pdfParse(req.file.buffer);
    if (!data.text || data.text.trim().length < 10) {
      return res.status(422).json({
        error:
          "Couldn't extract readable text from this PDF — it may be scanned/image-based. Use the \"Paste text instead\" option to type or paste the content directly.",
      });
    }

    res.json({ text: data.text, pages: data.numpages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

module.exports = router;
