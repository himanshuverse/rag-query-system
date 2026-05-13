import axios from "axios";

const buildGeminiUrl = (model, apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterMs = (retryAfter) => {
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(retryAfter);
  return Number.isNaN(dateMs) ? null : Math.max(0, dateMs - Date.now());
};

const buildUpstreamError = (err, message) => {
  const error = new Error(
    message || err.response?.data?.error?.message || err.message || "Upstream API error"
  );
  error.status = err.response?.status || 500;
  return error;
};

const isHardQuotaError = (err) => {
  const msg  = (err.response?.data?.error?.message || "").toLowerCase();
  const code = (err.response?.data?.error?.status  || "").toLowerCase();
  return (
    code === "resource_exhausted" ||
    msg.includes("quota exceeded") ||
    msg.includes("limit: 0") ||
    msg.includes("billing") ||
    msg.includes("free_tier")
  );
};

// Fail fast at import time rather than per-request
const API_KEY    = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_ATTEMPTS = 3;

if (!API_KEY) {
  const err = new Error("GEMINI_API_KEY is not configured on the server.");
  err.status = 500;
  throw err;
}

const buildPrompt = (query, context) =>
  `You are an AI assistant answering strictly from provided context.

Rules:
- Only use the given context
- If answer is not in context, say: "Not found in provided documents"
- Be concise and accurate

Context:
${context}

Question:
${query}`.trim();

export const generateAnswer = async (query, context) => {
  const url = buildGeminiUrl(GEMINI_MODEL, API_KEY);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await axios.post(url, {
        contents: [{ parts: [{ text: buildPrompt(query, context) }] }],
      });
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No answer generated.";
    } catch (err) {
      if (isHardQuotaError(err)) {
        throw buildUpstreamError(
          err,
          "Gemini quota is exhausted or billing is not enabled. Update quota/billing, then retry."
        );
      }

      if (err.response?.status !== 429 || attempt === MAX_ATTEMPTS) {
        throw buildUpstreamError(
          err,
          err.response?.status === 429
            ? "Rate limit reached for Gemini API. Please retry in a few seconds."
            : null
        );
      }

      const retryAfterMs = parseRetryAfterMs(err.response?.headers?.["retry-after"]);
      await sleep(retryAfterMs ?? 1000 * 2 ** (attempt - 1));
    }
  }

  // Safety net — should never reach here
  throw new Error("generateAnswer: exhausted all retry attempts.");
};