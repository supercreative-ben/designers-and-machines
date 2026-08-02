"use client";

import * as React from "react";

type ChatUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
};

type Message = {
  id: string;
  text: string;
  sentAt: number;
  user: ChatUser;
};

function timeAgo(timestamp: number) {
  const seconds = Math.max(0, (Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function Avatar({ user, size }: { user: ChatUser; size: number }) {
  return user.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatar}
      alt={user.name}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-[#55524F] object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#55524F] text-xs font-medium text-white"
      style={{ width: size, height: size }}
    >
      {user.name[0]}
    </div>
  );
}

export default function ChatTab() {
  const [status, setStatus] = React.useState<{
    loaded: boolean;
    configured: boolean;
    user: ChatUser | null;
  }>({ loaded: false, configured: false, user: null });
  const [messages, setMessages] = React.useState<Message[] | null>(null);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickToBottomRef = React.useRef(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled)
          setStatus({
            loaded: true,
            configured: data.configured,
            user: data.user,
          });
      })
      .catch(() => {
        if (!cancelled)
          setStatus({ loaded: true, configured: false, user: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll for messages while signed in.
  React.useEffect(() => {
    if (!status.user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/chat/messages");
        if (!res.ok) return;
        const data = (await res.json()) as { messages: Message[] };
        if (!cancelled) setMessages(data.messages);
      } catch {
        /* transient network error; next poll retries */
      }
    };
    void load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status.user]);

  // Keep the view pinned to the newest message unless the user scrolled up.
  React.useEffect(() => {
    if (stickToBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !status.user) return;
    setSending(true);
    setDraft("");
    stickToBottomRef.current = true;
    // Optimistic append; replaced by the server copy on the next poll.
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      text,
      sentAt: Date.now(),
      user: status.user,
    };
    setMessages((m) => [...(m ?? []), optimistic]);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const { message } = (await res.json()) as { message: Message };
      setMessages((m) =>
        (m ?? []).map((msg) => (msg.id === optimistic.id ? message : msg))
      );
    } catch {
      setMessages((m) => (m ?? []).filter((msg) => msg.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const disconnect = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setStatus((s) => ({ ...s, user: null }));
    setMessages(null);
  };

  if (!status.loaded) {
    return (
      <div className="flex h-full items-center justify-center pb-16">
        <p className="text-sm text-[#8B8885]">Loading…</p>
      </div>
    );
  }

  if (!status.user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5 pb-16">
        <a
          href={status.configured ? "/api/auth/x/login" : undefined}
          aria-disabled={!status.configured}
          className={`rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform ${
            status.configured
              ? "hover:scale-[1.03]"
              : "cursor-not-allowed opacity-60"
          }`}
        >
          Connect 𝕏 to chat
        </a>
        <p className="max-w-[230px] text-center text-sm leading-relaxed text-[#A5A19D]">
          {status.configured
            ? "To verify your identity"
            : "X sign-in isn't configured yet — check back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5"
      >
        {messages === null ? (
          <p className="text-sm text-[#8B8885]">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#8B8885]">
            No messages yet — say hi to the group.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <a
                  href={`https://x.com/${message.user.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Avatar user={message.user} size={30} />
                </a>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-white">
                      {message.user.name}
                    </span>
                    <span className="text-xs text-[#8B8885]">
                      {timeAgo(message.sentAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#D8D5D1]">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 px-5 pb-[72px]">
        <div className="flex items-center gap-2 rounded-xl bg-[#1D1B1A] px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message the group"
            maxLength={500}
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-[#8B8885] focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || sending}
            className="text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#8B8885]">
          <span>@{status.user.handle}</span>
          <button
            type="button"
            onClick={disconnect}
            className="transition-colors hover:text-white"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
