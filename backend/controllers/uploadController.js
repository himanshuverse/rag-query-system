import { extractText } from "../services/pdfParse.js";
import { chunkText } from "../services/chunkService.js";
import { generateEmbeddings } from "../services/embeddingService.js";
import { storeEmbeddings } from "../services/pineconeService.js";
import { recordUploadMemory } from "../services/memoryService.js";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "A PDF file is required." });
  }

  const { path: filePath, mimetype, originalname } = req.file;
  const { sessionId = "default-session" } = req.body;

  try {
    if (mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Uploaded file must be a PDF." });
    }

    const text = await extractText(filePath);

    if (!text?.trim()) {
      return res.status(400).json({ error: "The uploaded PDF did not contain readable text." });
    }

    const chunks = chunkText(text);
    if (!chunks.length || !chunks.some((c) => c.trim())) {
      return res.status(400).json({
        error: "The PDF could not be parsed into usable text chunks. If this is a scanned or image-only PDF, please use an OCR version.",
      });
    }

    const preview = text.substring(0, 200);
    const docId = randomUUID();
    const embeddings = await generateEmbeddings(chunks, docId);

    await storeEmbeddings(embeddings, chunks, {
      docId,
      fileName: originalname,
      namespace: sessionId,
    });

    await recordUploadMemory(sessionId, { fileName: originalname, preview, chunks: chunks.length });

    res.json({ message: "PDF parsed and indexed successfully.", chunks: chunks.length, preview, sessionId });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Failed to process uploaded PDF." });
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
};