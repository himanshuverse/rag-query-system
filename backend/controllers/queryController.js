import { generateEmbedding } from "../services/embeddingService.js";
import { queryPinecone } from "../services/pineconeService.js";
import { generateAnswer } from "../services/llmService.js";
import {
  getSessionMemoryContext,
  getSessionMemoryState,
  recordConversationTurn,
} from "../services/memoryService.js";

// --- Helpers ---

const getStatus = (err) => err.status || err.response?.status || 500;

const isQuotaOrBillingError = (err) => {
  const msg = (err.message || "").toLowerCase();
  return (
    err.status === 429 ||
    err.status === 403 ||
    msg.includes("quota") ||
    msg.includes("billing")
  );
};

const buildFallbackAnswer = (query, documentContext, memoryContext, reason) => {
  const combined = [memoryContext, documentContext].filter(Boolean).join("\n\n");

  if (!combined) {
    return `I could not generate an answer for "${query}" and no indexed context was available.${reason ? `\nReason: ${reason}` : ""}`;
  }

  return `I could not reach Gemini for "${query}", so here is the most relevant stored context instead:${reason ? `\nReason: ${reason}` : ""}\n\n${combined.slice(0, 1200)}`;
};

// --- Controllers ---

export const handleQuery = async (req, res) => {
  try {
    const { query, sessionId = "default-session" } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: "Query is required." });
    }

    const queryVector = await generateEmbedding(query);
    const results = await queryPinecone(queryVector, 3, sessionId);

    if (!results.length) {
      return res.status(404).json({ error: "No indexed documents found. Upload a PDF first." });
    }

    const documentContext = results.map((r) => r.metadata.text).join("\n");
    const memoryContext = await getSessionMemoryContext(sessionId);
    const context = [
      memoryContext && `Memory context:\n${memoryContext}`,
      `Document context:\n${documentContext}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    let answer;
    try {
      answer = await generateAnswer(query, context);
    } catch (err) {
      if (!isQuotaOrBillingError(err)) throw err;
      answer = buildFallbackAnswer(query, documentContext, memoryContext, err.message);
    }

    await recordConversationTurn(sessionId, { query, answer });

    res.json({ answer, sources: results, sessionId });
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message || "Internal server error" });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.query.sessionId || "default-session";
    res.json(await getSessionMemoryState(sessionId));
  } catch (err) {
    res.status(getStatus(err)).json({ error: err.message || "Internal server error" });
  }
};