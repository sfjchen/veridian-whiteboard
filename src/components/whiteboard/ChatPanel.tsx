"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/whiteboard/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (message: string) => void;
};

const QUICK_ACTIONS = [
  "Explain this mistake",
  "Give me a hint",
  "What should I try next?",
];

export function ChatPanel({ messages, loading, error, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;
    setDraft("");
    onSend(trimmed);
  };

  return (
    <aside className="chatPanel" aria-label="Socratic chat">
      <header className="chatHeader">
        <h2>Ask about your work</h2>
      </header>
      <div className="quickActions">
        {QUICK_ACTIONS.map((action) => (
          <button disabled={loading} key={action} onClick={() => onSend(action)} type="button">
            {action}
          </button>
        ))}
      </div>
      <div className="messages">
        {messages.length === 0 ? (
          <p className="emptyChat">Analyze your whiteboard, then ask for a hint.</p>
        ) : (
          messages.map((message) => (
            <div className={`message ${message.role}`} key={message.id}>
              {message.content}
            </div>
          ))
        )}
        {loading && <p className="emptyChat">Thinking…</p>}
      </div>
      {error && <p className="errorText">{error}</p>}
      <div className="chatInput">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Type a message…"
          rows={3}
        />
        <button disabled={!draft.trim() || loading} onClick={send} type="button">Send</button>
      </div>
    </aside>
  );
}
