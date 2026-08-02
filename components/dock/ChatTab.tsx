"use client";

import * as React from "react";
import Image from "next/image";
import { avatarUrl } from "@/data/events";

type Message = {
  id: number;
  name: string;
  handle?: string;
  sentAt: number;
  text: string;
};

function timeAgo(timestamp: number) {
  const seconds = Math.max(0, (Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Sample conversation shown until real X auth + a message backend exist.
const SAMPLE_MESSAGES: Message[] = [
  {
    id: 1,
    name: "Ben Issen",
    handle: "ben_issen",
    sentAt: Date.now() - 1000 * 60 * 60 * 5,
    text: "Doors open at 6:30, demos start at 7 sharp.",
  },
  {
    id: 2,
    name: "Pablo Stanley",
    handle: "pablo",
    sentAt: Date.now() - 1000 * 60 * 60 * 3,
    text: "Bringing a weird little sketch-to-3D thing, hope the wifi holds.",
  },
  {
    id: 3,
    name: "Ben Issen",
    handle: "ben_issen",
    sentAt: Date.now() - 1000 * 60 * 25,
    text: "It will. See everyone tonight!",
  },
];

export default function ChatTab() {
  const [connected, setConnected] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(SAMPLE_MESSAGES);
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { id: Date.now(), name: "You", sentAt: Date.now(), text },
    ]);
    setDraft("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  };

  if (!connected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5 pb-16">
        <button
          type="button"
          onClick={() => setConnected(true)}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
        >
          Connect to X to chat
        </button>
        <p className="text-sm text-[#A5A19D]">To verify your identity</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5"
      >
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              {message.handle ? (
                <Image
                  src={avatarUrl(message.handle)}
                  alt={message.name}
                  width={30}
                  height={30}
                  className="size-[30px] shrink-0 rounded-full bg-[#55524F] object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#55524F] text-xs font-medium text-white">
                  {message.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white">
                    {message.name}
                  </span>
                  <span className="text-xs text-[#8B8885]">
                    {timeAgo(message.sentAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-[#D8D5D1]">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 px-5 pb-[72px]">
        <div className="flex items-center gap-2 rounded-xl bg-[#1D1B1A] px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message the group"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-[#8B8885] focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            className="text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
