import axios from "axios";

const PYTHON_API = process.env.PYTHON_API_URL || "http://127.0.0.1:8000/embed/";

const fetchEmbedding = async (text) => {
  if (!text?.trim()) throw new Error("Embedding input must be a non-empty string.");

  try {
    const { data } = await axios.post(PYTHON_API, { text }, { timeout: 30000 });
    return data.embedding;
  } catch (err) {
    const message = err.response?.data?.detail || err.message;
    const error = new Error(`Embedding service request failed: ${message}`);
    error.status = err.response?.status || 503;
    throw error;
  }
};

export const generateEmbeddings = async (chunks, docId) => {
  const results = [];
  for (const [index, chunk] of chunks.entries()) {
    try {
      const values = await fetchEmbedding(chunk);
      results.push({ id: `${docId}-${index}`, values, text: chunk });
    } catch (err) {
      err.message = `Chunk ${index} embedding failed: ${err.message}`;
      throw err;
    }
  }
  return results;
};

export const generateEmbedding = fetchEmbedding;