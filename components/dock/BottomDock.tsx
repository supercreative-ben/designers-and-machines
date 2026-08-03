"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { MusicState, RopeSettings } from "./PlayTab";

// Tab contents are code-split out of the initial bundle; they're prefetched
// after load so opening a tab is still instant.
const PreviewTab = dynamic(() => import("./PreviewTab"));
const PlayTab = dynamic(() => import("./PlayTab"));
const ChatTab = dynamic(() => import("./ChatTab"));
const PeopleTab = dynamic(() => import("./PeopleTab"));
const JoinTab = dynamic(() => import("./JoinTab"));

export type TabId = "preview" | "play" | "chat" | "people" | "join";

const TABS: { id: TabId; label: string }[] = [
  { id: "preview", label: "Lineup" },
  { id: "chat", label: "Chat" },
  { id: "play", label: "Play" },
  { id: "people", label: "People" },
  { id: "join", label: "Join" },
];

const CARD_WIDTH = 352;
const CARD_HEIGHT = "min(500px, calc(100dvh - 96px))";

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

  // Warm the code-split tab chunks once the page has settled, so the first
  // tab open doesn't wait on a network fetch.
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      void import("./PreviewTab");
      void import("./PlayTab");
      void import("./ChatTab");
      void import("./PeopleTab");
      void import("./JoinTab");
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // On phones the card fills 92% of the viewport; elsewhere it's fixed.
  const [cardWidth, setCardWidth] = React.useState(CARD_WIDTH);

  React.useEffect(() => {
    const update = () =>
      setCardWidth(
        window.innerWidth < 640
          ? Math.round(window.innerWidth * 0.92)
          : CARD_WIDTH
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // The closed card collapses to exactly the pill's rect so opening reads as
  // the pill morphing into the card.
  const navRef = React.useRef<HTMLElement>(null);
  const [pill, setPill] = React.useState({ width: 298, height: 40 });

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () =>
      setPill({ width: el.offsetWidth, height: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-auto relative mt-6">
      {/* Expanding card: morphs between the pill's rect and full size.
          Content keeps its full-size layout and is cropped during the morph.
          `visibility` transitions discretely — it hides only once the close
          animation finishes, and shows immediately on open. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 overflow-hidden border border-white/[0.06] bg-[#3A3735]/95 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          activeTab ? "" : "pointer-events-none invisible"
        }`}
        style={
          activeTab
            ? {
                width: cardWidth,
                height: CARD_HEIGHT,
                borderRadius: 28,
                bottom: -12,
              }
            : {
                width: pill.width,
                height: pill.height,
                borderRadius: pill.height / 2,
                bottom: 0,
              }
        }
        role="dialog"
        aria-modal="false"
      >
        {/* Full-size inner frame so content never reflows while morphing */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: cardWidth, height: CARD_HEIGHT }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveTab(null)}
            className="absolute right-3.5 top-3.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-[#A5A19D] transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              className="size-3.5"
              aria-hidden
            >
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
            {renderedTab === "people" && <PeopleTab />}
            {renderedTab === "join" && <JoinTab />}
          </div>
        </div>
      </div>

      {/* Tab pill — stays on top of the card when it's open */}
      <nav
        ref={navRef}
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
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
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
