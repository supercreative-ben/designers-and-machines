"use client";

import * as React from "react";
import ThinkingIndicator from "@/components/ThinkingIndicator";

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
      loading="lazy"
      decoding="async"
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
  const [online, setOnline] = React.useState<number | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const stickToBottomRef = React.useRef(true);
  // The tab pill's rect, so the connect button can match it exactly.
  const [pill, setPill] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  // Surface OAuth failures passed back from the callback so sign-in
  // problems are visible instead of silently landing on an empty tab.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("chat_error");
    if (!reason) return;
    const friendly: Record<string, string> = {
      state: "Sign-in session expired — please try again.",
      token: "X rejected the app credentials — the client secret needs updating.",
      profile: "Couldn't load your X profile — please try again.",
      unconfigured: "X sign-in isn't configured yet.",
      access_denied: "X access was denied — please try again.",
    };
    setAuthError(friendly[reason] ?? `X sign-in failed (${reason}).`);
    params.delete("chat_error");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  }, []);

  React.useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const update = () =>
      setPill({ width: nav.offsetWidth, height: nav.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

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

  // Poll for messages — the chat is readable by everyone.
  React.useEffect(() => {
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
  }, []);

  // Keep the view pinned to the newest message unless the user scrolled up.
  React.useEffect(() => {
    if (stickToBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Live count of people currently on the site.
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/presence");
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setOnline(data.count);
      } catch {}
    };
    void load();
    const interval = setInterval(load, 25_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Grow the input with its content, up to a max height, then scroll inside.
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
  }, [draft, status.user]);

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

  if (!status.loaded) {
    return (
      <div className="flex h-full items-center justify-center pb-16">
        <ThinkingIndicator words={["Connecting", "Loading", "Syncing"]} />
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
          <ThinkingIndicator words={["Loading", "Fetching", "Listening"]} />
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
                  <p className="whitespace-pre-wrap break-words text-sm leading-snug text-[#D8D5D1]">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 10px insets make the composer the same width as the tab pill below */}
      <div className="shrink-0 px-[10px] pb-[58px]">
        {/* Only worth showing once it's an actual crowd — a lone "1
            connected" (the visitor themselves) reads as an empty room. */}
        <div className="pb-1.5 text-center text-[11px] text-[#8B8885]">
          {online !== null && online >= 2
            ? `${online} designers connected`
            : "\u00A0"}
        </div>
        {authError && (
          <p className="pb-2 text-center text-[11px] leading-snug text-[#E5928A]">
            {authError}
          </p>
        )}
        {!status.user ? (
          // Anyone can read the chat; connecting X is only needed to post.
          <a
            href={status.configured ? "/api/auth/x/login" : undefined}
            aria-disabled={!status.configured}
            className={`mx-auto flex items-center justify-center rounded-full bg-white text-sm font-medium text-black transition-transform ${
              status.configured
                ? "hover:scale-[1.02]"
                : "cursor-not-allowed opacity-60"
            }`}
            style={{ width: pill?.width, height: pill?.height ?? 40 }}
          >
            Connect 𝕏 to chat
          </a>
        ) : (
        <div className="flex items-end gap-2 rounded-[22px] border border-white/[0.1] py-1.5 pl-4 pr-1.5">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message the group"
            maxLength={280}
            className="min-w-0 flex-1 resize-none bg-transparent py-[7px] text-[13px] leading-snug text-white placeholder:text-[#8B8885] focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity disabled:opacity-40"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
              <path
                d="M8 12.5v-9M4.5 7 8 3.5 11.5 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
