import mongoose from "mongoose";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import SessionMemory from "../models/SessionMemory.js";

const DEFAULT_SESSION_ID = "default-session";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");
const storePath = path.join(dataDir, "memory.json");

// Module-level cache — valid for single-process deployments only
let cachedStore = null;

// --- Small helpers ---

const normalizeSessionId = (id) => id || DEFAULT_SESSION_ID;

const isMongoReady = () => mongoose.connection.readyState === 1;

const formatRole = (role) =>
  role === "assistant" ? "Assistant" : role === "user" ? "User" : "System";

const buildSummary = (messages = [], uploads = []) => {
  const lines = [
    ...uploads.slice(-3).map((u) => `Uploaded file: ${u.fileName}`),
    ...messages.slice(-8).map((m) => `${formatRole(m.role)}: ${m.text}`),
  ];
  return lines.join("\n").slice(-1200);
};

const buildContext = (session) => {
  const recentUploads = (session.uploads || [])
    .slice(-3)
    .map((u) => `Uploaded file: ${u.fileName} (${u.chunks} chunks)`);

  const recentMessages = (session.messages || [])
    .slice(-6)
    .map((m) => `${formatRole(m.role)}: ${m.text}`);

  return [
    session.summary    && `Session summary:\n${session.summary}`,
    recentUploads.length && `Recent uploads:\n${recentUploads.join("\n")}`,
    recentMessages.length && `Recent conversation:\n${recentMessages.join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const toSerializableMessage = ({ role, text }) => ({ role, text });
const toSerializableUpload  = ({ fileName, preview = "", chunks = 0 }) => ({ fileName, preview, chunks });

const serializeSession = (sessionId, session) => ({
  sessionId: normalizeSessionId(sessionId),
  summary:  session.summary  || "",
  messages: (session.messages || []).map(toSerializableMessage),
  uploads:  (session.uploads  || []).map(toSerializableUpload),
});

const getEmptyMemoryState = (sessionId) =>
  serializeSession(sessionId, { summary: "", messages: [], uploads: [] });

// --- Local (JSON file) storage ---

const loadLocalStore = async () => {
  if (cachedStore) return cachedStore;
  try {
    cachedStore = JSON.parse(await readFile(storePath, "utf8"));
  } catch {
    cachedStore = { sessions: {} };
  }
  return cachedStore;
};

const persistLocalStore = async () => {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(cachedStore, null, 2), "utf8");
};

const getLocalSession = (store, sessionId) => {
  const id = normalizeSessionId(sessionId);
  store.sessions[id] ??= { sessionId: id, summary: "", messages: [], uploads: [] };
  return store.sessions[id];
};

// --- Mongo storage ---

const getMongoSession = async (sessionId) => {
  const id = normalizeSessionId(sessionId);
  return (
    (await SessionMemory.findOne({ sessionId: id })) ||
    (await SessionMemory.create({ sessionId: id }))
  );
};

// --- Fallback wrapper ---
// Tries Mongo first; silently falls through to local storage if unavailable.

const withMongoFallback = async (mongoFn, localFn) => {
  if (isMongoReady()) {
    try {
      return await mongoFn();
    } catch {
      // Mongo unavailable mid-request — falling through to local storage
    }
  }
  return localFn();
};

// --- Public API ---

export const recordUploadMemory = (sessionId, upload) => {
  const payload = toSerializableUpload(upload);

  return withMongoFallback(
    async () => {
      const session = await getMongoSession(sessionId);
      session.uploads.push(payload);
      session.summary = buildSummary(session.messages, session.uploads);
      await session.save();
    },
    async () => {
      const store = await loadLocalStore();
      const session = getLocalSession(store, sessionId);
      session.uploads.push(payload);
      session.summary = buildSummary(session.messages, session.uploads);
      await persistLocalStore();
    }
  );
};

export const recordConversationTurn = (sessionId, { query, answer }) => {
  const messages = [
    { role: "user",      text: query  },
    { role: "assistant", text: answer },
  ];

  return withMongoFallback(
    async () => {
      const session = await getMongoSession(sessionId);
      session.messages.push(...messages);
      session.summary = buildSummary(session.messages, session.uploads);
      await session.save();
    },
    async () => {
      const store = await loadLocalStore();
      const session = getLocalSession(store, sessionId);
      session.messages.push(...messages);
      session.summary = buildSummary(session.messages, session.uploads);
      await persistLocalStore();
    }
  );
};

export const getSessionMemoryContext = (sessionId) => {
  const id = normalizeSessionId(sessionId);

  return withMongoFallback(
    async () => {
      const session = await SessionMemory.findOne({ sessionId: id }).lean();
      return session ? buildContext(session) : null;
    },
    async () => {
      const store = await loadLocalStore();
      return buildContext(getLocalSession(store, id));
    }
  );
};

export const getSessionMemoryState = (sessionId) => {
  const id = normalizeSessionId(sessionId);

  return withMongoFallback(
    async () => {
      const session = await SessionMemory.findOne({ sessionId: id }).lean();
      return session ? serializeSession(id, session) : null;
    },
    async () => {
      const store = await loadLocalStore();
      const session = store.sessions[id];
      return session ? serializeSession(id, session) : getEmptyMemoryState(id);
    }
  );
};