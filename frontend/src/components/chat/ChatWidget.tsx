"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

type Role = "user" | "assistant" | "system";
type Message = { role: Role; content: string };

const WELCOME: Message = {
  role: "assistant",
  content:
    "👋 Hi! I'm CareerBridge AI. Ask me about CVs, interviews, internships, or career paths in East Africa.",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom whenever messages or loading change.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, isOpen]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (isOpen) {
      // Wait one frame so the panel is mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      // Keep the user's message in the list so the conversation flow stays intact.
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(e as unknown as FormEvent);
    }
  }

  return (
    <>
      {isOpen && (
        <FloatingAiPanel
          messages={messages}
          input={input}
          loading={loading}
          error={error}
          bodyRef={bodyRef}
          inputRef={inputRef}
          onClose={() => setIsOpen(false)}
          onInputChange={setInput}
          onSubmit={sendMessage}
          onKeyDown={handleKeyDown}
        />
      )}
      <FloatingAiButton isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />
    </>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function FloatingAiButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Close CareerBridge AI" : "Open CareerBridge AI"}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
    >
      {isOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h6" />
        </svg>
      )}
    </button>
  );
}

interface PanelProps {
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onInputChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

function FloatingAiPanel(props: PanelProps) {
  const {
    messages,
    input,
    loading,
    error,
    bodyRef,
    inputRef,
    onClose,
    onInputChange,
    onSubmit,
    onKeyDown,
  } = props;

  return (
    <div
      role="dialog"
      aria-label="CareerBridge AI chat"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[540px] sm:w-[380px] sm:rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="text-sm font-semibold">CareerBridge AI</p>
          <p className="text-xs text-white/80">Powered by OpenAI · Beta</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4"
      >
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 border-t border-border bg-card px-3 py-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask me anything…"
          className="min-h-[40px] max-h-32 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m22 2-7 20-4-9-9-4 20-7Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, content }: Message) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-white shadow-sm">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
      </div>
    </div>
  );
}
