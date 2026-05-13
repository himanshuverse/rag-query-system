import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const SESSION_KEY = "docquerySessionId";
const hasWindow = typeof window !== "undefined";

const getSessionMessagesKey = (sessionId) => `docqueryMessages:${sessionId}`;
const getSessionUploadsKey = (sessionId) => `docqueryUploads:${sessionId}`;

const loadCachedMessages = (sessionId) => {
  if (!hasWindow || !sessionId) return [];
  try {
    const raw = localStorage.getItem(getSessionMessagesKey(sessionId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((m) => m?.role && typeof m?.text === "string")
      : [];
  } catch {
    return [];
  }
};

const loadCachedUploads = (sessionId) => {
  if (!hasWindow || !sessionId) return [];
  try {
    const raw = localStorage.getItem(getSessionUploadsKey(sessionId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((u) => typeof u?.fileName === "string")
      : [];
  } catch {
    return [];
  }
};

const cacheMessages = (sessionId, messages) => {
  if (!hasWindow || !sessionId) return;
  const serializable = (messages || []).filter(
    (m) => !m.loading && m?.role && typeof m?.text === "string",
  );
  localStorage.setItem(
    getSessionMessagesKey(sessionId),
    JSON.stringify(serializable),
  );
};

const cacheUploads = (sessionId, uploads) => {
  if (!hasWindow || !sessionId) return;
  const serializable = (uploads || [])
    .filter((u) => typeof u?.fileName === "string")
    .map((u) => ({
      fileName: u.fileName,
      chunks: Number(u.chunks || 0),
      preview: u.preview || "",
    }));
  localStorage.setItem(
    getSessionUploadsKey(sessionId),
    JSON.stringify(serializable),
  );
};

const getOrCreateSessionId = () => {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, created);
  return created;
};

export const useDocQueryState = () => {
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY) || "default-session";
    return loadCachedMessages(id);
  });
  const [uploads, setUploads] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY) || "default-session";
    return loadCachedUploads(id);
  });

  const isChatWorkspace =
    messages.length > 0 || uploads.length > 0 || Boolean(file);

  useEffect(() => {
    if (messages.length === 0) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const response = await api.get(
          `/api/query/history/${encodeURIComponent(sessionId)}`,
        );
        const history = response?.data;
        if (cancelled) return;

        const restoredMessages = Array.isArray(history?.messages)
          ? history.messages.filter(
              (m) => m?.role && typeof m?.text === "string",
            )
          : [];
        const restoredUploads = Array.isArray(history?.uploads)
          ? history.uploads.filter((u) => typeof u?.fileName === "string")
          : [];

        const cachedMessages = loadCachedMessages(sessionId);
        const cachedUploads = loadCachedUploads(sessionId);

        // Prefer server-restored history but keep unique cached items
        const mergedMessages = [...restoredMessages];
        const seen = new Set(
          restoredMessages.map((m) => `${m.role}::${m.text}`),
        );
        for (const cm of cachedMessages) {
          const key = `${cm.role}::${cm.text}`;
          if (!seen.has(key)) {
            mergedMessages.push(cm);
            seen.add(key);
          }
        }

        const mergedUploads = [...restoredUploads];
        const seenUploads = new Set(restoredUploads.map((u) => u.fileName));
        for (const cu of cachedUploads) {
          if (!seenUploads.has(cu.fileName)) mergedUploads.push(cu);
        }

        setMessages(mergedMessages);
        setUploads(mergedUploads);
        cacheMessages(sessionId, mergedMessages);
        cacheUploads(sessionId, mergedUploads);
      } catch {
        // Keep cached data on backend hydrate failures.
      }
    };

    hydrateSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    cacheMessages(sessionId, messages);
  }, [sessionId, messages]);

  useEffect(() => {
    cacheUploads(sessionId, uploads);
  }, [sessionId, uploads]);

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  const emptyStateMessages = [
    "Upload a PDF to get started",
    "Ask questions about your documents",
    "Get instant, context-aware answers",
  ];

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const nextFile = {
      file: selected,
      preview: URL.createObjectURL(selected),
      loading: true,
    };

    setFile(nextFile);
    setTimeout(() => {
      setFile((prev) => (prev ? { ...prev, loading: false } : prev));
    }, 1200);
  };

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newSessionId);
    // clear any session-specific cached flags
    setSessionId(newSessionId);
    setMessages([]);
    setUploads([]);
    setQuery("");
    setFile(null);
  };

  const handleSubmit = async () => {
    const hasFileInStorage = uploads.length > 0;

    if (!file && !hasFileInStorage) {
      toast.error("No file uploaded. Please upload a document first");
      return;
    }

    if (!query.trim()) return;

    const currentQuery = query;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: currentQuery },
      { role: "assistant", loading: true },
    ]);
    setQuery("");

    let activeSessionId = sessionId;

    if (file) {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("sessionId", activeSessionId);

      try {
        const uploadResponse = await api.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadResponse?.data?.sessionId) {
          localStorage.setItem(SESSION_KEY, uploadResponse.data.sessionId);
          setSessionId(uploadResponse.data.sessionId);
          activeSessionId = uploadResponse.data.sessionId;
        }

        setUploads((prev) => [
          ...prev,
          {
            fileName: file.file.name,
            chunks: uploadResponse?.data?.chunks || 0,
            preview: uploadResponse?.data?.preview || "",
          },
        ]);

        setFile(null);
      } catch (error) {
        const uploadErrorMessage =
          error?.response?.data?.error ||
          error?.message ||
          "File upload failed";
        toast.error(uploadErrorMessage);
        console.error("Upload error:", error);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            text: uploadErrorMessage,
          };
          return next;
        });
        return;
      }
    }

    try {
      const response = await api.post("/api/query", {
        query: currentQuery,
        sessionId: activeSessionId,
      });

      if (response?.data?.sessionId) {
        localStorage.setItem(SESSION_KEY, response.data.sessionId);
        setSessionId(response.data.sessionId);
      }

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          text: response?.data?.answer || "No response yet",
        };
        return next;
      });
    } catch (error) {
      toast.error((error && error.message) || "Error getting response");
      console.error("Query error:", error);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          text: "Error getting response",
        };
        return next;
      });
    }
  };

  return {
    file,
    query,
    uploads,
    messages,
    emptyStateMessages,
    isChatWorkspace,
    fileInputRef,
    messagesEndRef,
    setFile,
    setQuery,
    handleFileClick,
    handleFileChange,
    handleNewChat,
    handleSubmit,
  };
};
