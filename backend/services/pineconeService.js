import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_NAMESPACE  = process.env.PINECONE_NAMESPACE || "docquery";

if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  const err = new Error("Pinecone is not configured. Set PINECONE_API_KEY and PINECONE_INDEX_NAME.");
  err.status = 500;
  throw err;
}

const pineconeIndex = new Pinecone({ apiKey: PINECONE_API_KEY })
  .index(PINECONE_INDEX_NAME);

const getNamespace = (suffix) => {
  const ns = suffix ? `${PINECONE_NAMESPACE}-${suffix}` : PINECONE_NAMESPACE;
  return pineconeIndex.namespace(ns);
};

const chunkArray = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
};

export const storeEmbeddings = async (embeddings, chunks, metadata = {}) => {
  if (!embeddings.length) return;

  const expectedDim = embeddings[0].values.length;
  if (embeddings.some((e) => e.values.length !== expectedDim)) {
    const err = new Error("Embedding vectors have inconsistent dimensions.");
    err.status = 500;
    throw err;
  }

  const docId = metadata.docId || `doc-${Date.now()}`;
  const ns    = getNamespace(metadata.namespace);

  const records = embeddings.map((embedding, i) => ({
    id:       embedding.id ?? `${docId}-${i}`,
    values:   embedding.values,
    metadata: {
      text:       chunks[i],
      docId,
      fileName:   metadata.fileName || "unknown",
      chunkIndex: i,
    },
  }));

  for (const batch of chunkArray(records, 100)) {
    await ns.upsert({ records: batch });
  }
};

export const queryPinecone = async (queryVector, topK = 3, namespaceSuffix = "") => {
  if (!Array.isArray(queryVector) || !queryVector.length) {
    const err = new Error("Query embedding is empty or invalid.");
    err.status = 400;
    throw err;
  }

  const response = await getNamespace(namespaceSuffix).query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return response.matches || [];
};