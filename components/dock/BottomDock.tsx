"use client";

import * as React from "react";
import PreviewTab from "./PreviewTab";
import PlayTab, { type MusicState, type RopeSettings } from "./PlayTab";
import ChatTab from "./ChatTab";
import JoinTab from "./JoinTab";

export type TabId = "preview" | "play" | "chat" | "join";

const TABS: { id: TabId; label: string }[] = [
  { id: "preview", label: "Lineup" },
  { id: "play", label: "Play" },
  { id: "chat", label: "Chat" },
  { id: "join", label: "Join" },
];

const CARD_WIDTH = 320;

export default function BottomDock({
  settings,
  onSettingsChange,
  music,
  onMusicChange,
}: {
  settings: RopeSettings;
  onSettingsChange: (settings: RopeSettings) => void;
  music: MusicState;
  onMusicChange: (music: MusicState) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<TabId | null>(null);
  // Keep the last tab's content mounted while the card animates out, so it
  // doesn't fade away empty.
  const [renderedTab, setRenderedTab] = React.useState<TabId | null>(null);

  React.useEffect(() => {
    if (activeTab) {
      setRenderedTab(activeTab);
      return;
    }
    const timeout = setTimeout(() => setRenderedTab(null), 500);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  // Returning from the X OAuth flow lands on /#chat — open the Chat tab.
  React.useEffect(() => {
    if (window.location.hash === "#chat") {
      setActiveTab("chat");
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  React.useEffect(() => {
    if (!activeTab) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveTab(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTab]);

  return (
    <div className="pointer-events-auto relative mt-6">
      {/* Expanding card. Same size for every tab; content scrolls vertically. */}
      <div
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 origin-bottom overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#3A3735]/95 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          activeTab
            ? "opacity-100 scale-100 translate-y-0"
            : "pointer-events-none opacity-0 scale-[0.97] translate-y-4"
        }`}
        style={{
          width: CARD_WIDTH,
          height: "min(470px, calc(100dvh - 96px))",
        }}
        role="dialog"
        aria-modal="false"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setActiveTab(null)}
          className="absolute right-3.5 top-3.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-[#A5A19D] transition-colors hover:text-white"
        >
          <svg viewBox="0 0 14 14" fill="none" className="size-3.5" aria-hidden>
            <path
              d="M2 2L12 12M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="h-full">
          {renderedTab === "preview" && (
            <PreviewTab onNavigate={setActiveTab} />
          )}
          {renderedTab === "play" && (
            <PlayTab
              settings={settings}
              onSettingsChange={onSettingsChange}
              music={music}
              onMusicChange={onMusicChange}
            />
          )}
          {renderedTab === "chat" && <ChatTab />}
          {renderedTab === "join" && <JoinTab />}
        </div>
      </div>

      {/* Tab pill — stays on top of the card when it's open */}
      <nav
        className={`relative z-10 flex items-center rounded-full border p-[3px] transition-colors ${
          activeTab
            ? "border-transparent bg-[#211E1C]"
            : "border-white/[0.06] bg-[#2A2725]/90"
        }`}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-sound="tab"
              onClick={() => setActiveTab(active ? null : tab.id)}
              className={`rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-white text-black"
                  : "text-[#A29E9A] hover:text-[#EDEAE6]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
