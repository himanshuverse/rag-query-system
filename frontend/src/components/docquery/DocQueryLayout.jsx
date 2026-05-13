import { Link } from "react-router-dom";
import { MessageCircle, Paperclip, Plus } from "lucide-react";

/* ── Shared style helpers ─────────────────────────────────────── */
const card = {
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
};

/* ── Empty State ──────────────────────────────────────────────── */
const HINTS = [
  "Summarise the key findings",
  "What does section 3 cover?",
  "Compare the data in table 2",
];

const EmptyState = ({ items }) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "32px 24px",
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "var(--radius-lg)",
        background:
          "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        boxShadow: "0 4px 24px rgba(124,58,237,0.3)",
      }}
    >
      <MessageCircle size={26} color="#fff" />
    </div>

    <h2
      style={{
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: "var(--color-text)",
        marginBottom: 10,
      }}
    >
      Chat with your documents
    </h2>
    <p
      style={{
        maxWidth: 400,
        fontSize: 14,
        color: "var(--color-text-2)",
        lineHeight: 1.7,
        marginBottom: 32,
      }}
    >
      Upload a PDF and start asking questions. Get instant, accurate answers
      powered by AI.
    </p>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {(items.length ? items : HINTS).map((msg) => (
        <div
          key={msg}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-accent-lt)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13.5,
              color: "var(--color-text-2)",
              fontStyle: "italic",
            }}
          >
            "{msg}"
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Message List ─────────────────────────────────────────────── */
const MessageList = ({ messages, messagesEndRef }) => (
  <div style={{ height: "100%", overflowY: "auto" }}>
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {messages.length > 0 ? (
        messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className="animate-slideUp"
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 16px",
                fontSize: 14,
                lineHeight: 1.65,
                borderRadius:
                  msg.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                    : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                ...(msg.role === "user"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))",
                      color: "#fff",
                      boxShadow: "0 2px 12px rgba(124,58,237,0.25)",
                    }
                  : {
                      ...card,
                      color: "var(--color-text)",
                    }),
              }}
            >
              {msg.loading ? (
                <div className="dot-pulse" style={{ display: "flex", gap: 5 }}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))
      ) : (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-text-3)",
            paddingTop: 32,
          }}
        >
          Document loaded. Ask a question to begin.
        </p>
      )}
      <div ref={messagesEndRef} />
    </div>
  </div>
);

/* ── Composer ─────────────────────────────────────────────────── */
const Composer = ({
  uploads,
  file,
  fileInputRef,
  query,
  setFile,
  setQuery,
  onAttach,
  onFileChange,
  onSubmit,
}) => (
  <div style={{ maxWidth: 680, margin: "0 auto", padding: "14px 20px 20px" }}>
    {/* Uploaded file chips */}
    {!file && uploads.length > 0 && (
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
      >
        {uploads.map((u, i) => (
          <span
            key={`${u.fileName}-${i}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              fontSize: 12,
              color: "var(--color-text-2)",
            }}
          >
            <span>📄</span>
            <span
              style={{
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {u.fileName}
            </span>
          </span>
        ))}
      </div>
    )}

    {/* Pending file preview */}
    {file && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          marginBottom: 10,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>📄</span>
          <span
            style={{
              fontSize: 13,
              color: "var(--color-text-2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.file.name}
          </span>
          {file.loading && (
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid var(--color-accent-lt)",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <button
          onClick={() => {
            if (file?.preview) URL.revokeObjectURL(file.preview);
            setFile(null);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-3)",
            fontSize: 16,
            padding: "2px 4px",
            marginLeft: 10,
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-3)")
          }
        >
          ✕
        </button>
      </div>
    )}

    {/* Input row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        transition: "border-color 0.2s",
      }}
      onFocusCapture={(e) =>
        (e.currentTarget.style.borderColor = "rgba(124,58,237,0.45)")
      }
      onBlurCapture={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border)")
      }
    >
      <button
        onClick={onAttach}
        title="Attach PDF (Ctrl+U)"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-3)",
          padding: "4px",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--color-accent-lt)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--color-text-3)")
        }
      >
        <Paperclip size={18} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Ask a question about your documents…"
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 14,
          color: "var(--color-text)",
        }}
      />

      <button
        onClick={onSubmit}
        style={{
          padding: "7px 18px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          transition: "opacity 0.15s, transform 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Send
      </button>
    </div>
  </div>
);

/* ── Layout ───────────────────────────────────────────────────── */
const DocQueryLayout = ({
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
  onNewChat,
  onAttach,
  onFileChange,
  onSubmit,
}) => (
  <div
    style={{
      height: "100dvh",
      overflow: "hidden",
      background: "var(--color-bg)",
      color: "var(--color-text)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
    }}
  >
    {/* Header */}
    <header
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(7,8,15,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 28px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(120deg, var(--color-accent-lt), #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          DocQuery
        </Link>
        <button
          onClick={onNewChat}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "var(--color-accent-lt)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,58,237,0.25)";
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(124,58,237,0.15)";
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
          }}
        >
          <Plus size={14} /> New Chat
        </button>
      </div>
    </header>

    {/* Main */}
    <main style={{ minHeight: 0, overflow: "hidden" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          height: "100%",
          padding: "0 28px",
        }}
      >
        <div style={{ height: "100%", maxWidth: 720, margin: "0 auto" }}>
          {isChatWorkspace ? (
            <MessageList messages={messages} messagesEndRef={messagesEndRef} />
          ) : (
            <EmptyState items={emptyStateMessages} />
          )}
        </div>
      </div>
    </main>

    {/* Footer / Composer */}
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "rgba(7,8,15,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Composer
            uploads={uploads}
            file={file}
            fileInputRef={fileInputRef}
            query={query}
            setFile={setFile}
            setQuery={setQuery}
            onAttach={onAttach}
            onFileChange={onFileChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </footer>
  </div>
);

export default DocQueryLayout;
