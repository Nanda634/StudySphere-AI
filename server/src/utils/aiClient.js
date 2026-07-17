// AI client — Google Gemini only. Get a free API key (no billing required) at
// https://aistudio.google.com/apikey and set GEMINI_API_KEY in server/.env.
require("dotenv").config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function requireApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to server/.env.");
    err.nonRetryable = true;
    throw err;
  }
  return apiKey;
}

/**
 * Calls Gemini with a system + user prompt and returns the raw text reply. Pass { json: true }
 * when the caller needs a structured JSON response back — this puts Gemini in strict JSON mode,
 * where it can no longer wrap the answer in commentary or markdown fences. Plain-text callers
 * (chat replies, feedback strings) must leave json unset, or Gemini will return their reply as
 * a quoted JSON string instead of plain prose.
 */
async function callAI({ system, user }, { json = false } = {}) {
  const apiKey = requireApiKey();

  const generationConfig = { temperature: 0.2, maxOutputTokens: 8192 };
  if (json) generationConfig.responseMimeType = "application/json";

  const res = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("\n");
  if (!text) {
    // Most common cause: the response was cut off by a safety filter or hit maxOutputTokens
    // with no text yet (finishReason "SAFETY" or "MAX_TOKENS" with empty parts).
    const finishReason = data.candidates?.[0]?.finishReason;
    throw new Error(`Gemini returned no text (finishReason: ${finishReason || "unknown"})`);
  }
  return text;
}

/**
 * Sends an image (base64) plus a question to Gemini — it supports multimodal input natively on
 * the same generateContent endpoint used for text.
 */
async function callVision({ prompt, imageBase64, mimeType = "image/jpeg" }) {
  const apiKey = requireApiKey();

  const res = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini vision error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("\n");
  if (!text) {
    const finishReason = data.candidates?.[0]?.finishReason;
    throw new Error(`Gemini returned no text for that image (finishReason: ${finishReason || "unknown"})`);
  }
  return text;
}

/**
 * Strips markdown code fences that models sometimes add around JSON, then parses. If that still
 * fails, falls back to extracting the substring between the first `{`/`[` and the matching last
 * `}`/`]` — handles a stray "Sure, here's your JSON:" preamble or trailing note some models add
 * even when told not to.
 */
function safeJsonParse(raw) {
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.search(/[{[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (e2) {
        // fall through to the error below
      }
    }
    const err = new Error("AI did not return valid JSON: " + cleaned.slice(0, 200));
    err.isParseError = true; // distinguishes "got text, couldn't parse it" from provider/auth errors
    throw err;
  }
}

/**
 * Calls Gemini and parses its JSON response, retrying automatically if the response is
 * malformed or truncated. Every route that needs structured JSON back from Goose should go
 * through this, not callAI() directly, so this protection is applied consistently everywhere.
 */
async function callAIJson({ system, user }, { onRetry, maxAttempts = 3 } = {}) {
  let lastErr;
  let raw = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      raw = await callAI({ system, user }, { json: true });
      return safeJsonParse(raw);
    } catch (err) {
      lastErr = err;
      // A missing/invalid API key won't fix itself on retry — retrying just wastes 3x the
      // wait time before showing the same error. Fail immediately with the real message.
      if (err.nonRetryable) throw err;
      if (attempt < maxAttempts && onRetry) onRetry(attempt);
    }
  }

  // If the last failure was a genuine "got text back but couldn't parse it as JSON" case, show
  // the generic retry-exhausted message. But if it was a real provider error (invalid API key,
  // rate limit, network issue, safety block) that just happened to also survive 3 retries,
  // showing "couldn't be parsed" would be actively misleading — surface the real error instead.
  if (!lastErr?.isParseError) {
    throw lastErr;
  }

  const finalErr = new Error(
    "Goose's response couldn't be parsed after a few retries. This is usually temporary — try again, or try a smaller count if it keeps happening."
  );
  finalErr.rawResponse = raw;
  finalErr.cause = lastErr;
  throw finalErr;
}

module.exports = { callAI, callAIJson, callVision, safeJsonParse };
