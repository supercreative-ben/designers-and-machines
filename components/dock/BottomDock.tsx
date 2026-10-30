"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { LUMA_EVENT_SLUG } from "@/data/site";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import {
  FluidHoverHighlight,
  resolveHighlightTransition,
  toTarget,
} from "@/components/ui/fluid-hover-highlight";
import { spring } from "@/lib/springs";
import type { MusicState, RopeSettings } from "./PlayTab";

// Tab contents are code-split out of the initial bundle; they're prefetched
// after load so opening a tab is still instant.
const PreviewTab = dynamic(() => import("./PreviewTab"));
const PlayTab = dynamic(() => import("./PlayTab"));
const ChatTab = dynamic(() => import("./ChatTab"));
const JoinTab = dynamic(() => import("./JoinTab"));

export type TabId = "preview" | "play" | "chat" | "join";

const TABS: { id: TabId; label: string }[] = [
  { id: "preview", label: "People" },
  { id: "chat", label: "Chat" },
  { id: "play", label: "Play" },
  { id: "join", label: "Join" },
];

/** Gap between the pill and the card's left/right/bottom edges. */
const PILL_GAP = 12;
const CARD_HEIGHT = "min(500px, calc(100dvh - 96px))";

/** Keep the exiting panel inert while AnimatePresence finishes its fade. */
function DockPanel({
  id,
  labelledBy,
  children,
}: {
  id: string;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const present = useIsPresent();
  const reduceMotion = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const hidden = {
    opacity: 0,
    y: reduceMotion ? 0 : 16,
    scale: reduceMotion ? 1 : 0.98,
  };

  React.useEffect(() => {
    if (present) panelRef.current?.focus({ preventScroll: true });
  }, [present]);

  return (
    <motion.div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      inert={!present}
      tabIndex={-1}
      className="absolute inset-0 isolate origin-bottom overflow-hidden rounded-[28px] border border-white/[0.06] shadow-[0_30px_80px_rgba(0,0,0,0.5)] outline-none [--dock-panel-color:58_55_53]"
      style={{ pointerEvents: present ? "auto" : "none" }}
      initial={hidden}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ ...hidden, transition: spring.slow.exit }}
      transition={spring.slow}
    >
      {/* Keep the filtered glass behind the content, rather than making the
          scrolling tweets descendants of a backdrop-filtered layer. */}
      <div
        aria-hidden="true"
        data-slot="dock-panel-surface"
        className="pointer-events-none absolute inset-0 -z-10 bg-[rgb(var(--dock-panel-color)/0.95)] backdrop-blur-md"
      />
      {children}
    </motion.div>
  );
}

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
  const panelId = React.useId();
  const navItemsRef = React.useRef<(HTMLElement | null)[]>([]);
  const reduceMotion = useReducedMotion() ?? false;
  const closePanel = React.useCallback(() => {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    setActiveTab(null);
    navItemsRef.current[index]?.focus({ preventScroll: true });
  }, [activeTab]);

  // Returning from the X OAuth flow lands on /#chat — open the Chat tab.
  React.useEffect(() => {
    if (window.location.hash !== "#chat") return;
    // Let hydration and the navigation's first measurement finish before
    // opening the panel and positioning its active pill.
    const frame = requestAnimationFrame(() => {
      setActiveTab("chat");
      history.replaceState(
        history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (!activeTab) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
      e.preventDefault();
      closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTab, closePanel]);

  // Warm the code-split tab chunks once the page has settled, so the first
  // tab open doesn't wait on a network fetch.
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      void import("./PreviewTab");
      void import("./PlayTab");
      void import("./ChatTab");
      void import("./JoinTab");
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // On phones the card fills 92% of the viewport and the pill stretches to
  // match; elsewhere the pill keeps its natural width and the card hugs it.
  const [mobileCardWidth, setMobileCardWidth] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    const update = () =>
      setMobileCardWidth(
        window.innerWidth < 640 ? Math.round(window.innerWidth * 0.92) : null
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // One measured coordinate space for both the active and hover pills.
  const navRef = React.useRef<HTMLElement>(null);
  const hover = useFluidHover(navRef, { axis: "x" });
  const { registerItem } = hover;
  const navItemRefs = React.useMemo(
    () =>
      TABS.map(
        (_, index) => (element: HTMLButtonElement | HTMLAnchorElement | null) => {
          navItemsRef.current[index] = element;
          registerItem(index, element);
        }
      ),
    [registerItem]
  );
  const [navWidth, setNavWidth] = React.useState(298);

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () => setNavWidth(el.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Same PILL_GAP breathing room on the card's left, right, and bottom.
  const cardWidth = mobileCardWidth ?? navWidth + PILL_GAP * 2;
  const selectedIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const selectedRect = hover.isMeasured
    ? hover.itemRects[selectedIndex] ?? null
    : null;
  const hoveredRect =
    hover.isMeasured && hover.activeIndex !== null
      ? hover.itemRects[hover.activeIndex] ?? null
      : null;
  const hoveringOther = hoveredRect !== null && hover.activeIndex !== selectedIndex;

  return (
    <div className="pointer-events-auto relative isolate mt-6">
      {/* The panel keeps its own shape and exits behind the opaque dock. */}
      <div
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2"
        style={{ width: cardWidth, height: CARD_HEIGHT, bottom: -PILL_GAP }}
      >
        <AnimatePresence>
          {activeTab && (
            <DockPanel
              key="dock-panel"
              id={panelId}
              labelledBy={`${panelId}-${activeTab}`}
            >
              <button
                type="button"
                aria-label="Close"
                aria-keyshortcuts="Escape"
                onClick={closePanel}
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
                {activeTab === "preview" && (
                  <PreviewTab onNavigate={setActiveTab} />
                )}
                {activeTab === "play" && (
                  <PlayTab
                    settings={settings}
                    onSettingsChange={onSettingsChange}
                    music={music}
                    onMusicChange={onMusicChange}
                  />
                )}
                {activeTab === "chat" && <ChatTab />}
                {activeTab === "join" && <JoinTab />}
              </div>
            </DockPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Tab pill — stays on top of the card when it's open */}
      <nav
        ref={navRef}
        aria-label="Main navigation"
        {...hover.handlers}
        style={
          mobileCardWidth
            ? { width: mobileCardWidth - PILL_GAP * 2 }
            : undefined
        }
        className="relative z-20 flex items-center rounded-full border border-white/[0.06] bg-[#2A2725] p-[3px]"
      >
        <AnimatePresence>
          {selectedRect && (
            <motion.div
              key="active-tab"
              aria-hidden
              data-slot="dock-active-tab"
              className="pointer-events-none absolute left-0 top-0 rounded-full bg-active"
              initial={false}
              animate={{
                ...toTarget(selectedRect),
                opacity: hoveringOther ? 0.8 : 1,
              }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={resolveHighlightTransition(spring.moderate, reduceMotion)}
            />
          )}
        </AnimatePresence>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: hoveringOther ? 0.4 : 0 }}
          transition={hoveringOther ? spring.fast : spring.fast.exit}
        >
          <FluidHoverHighlight
            rect={hoveringOther ? hoveredRect : selectedRect}
            session={hover.session}
            from={selectedRect}
            transition={hoveringOther ? spring.fast : spring.moderate}
            className="rounded-full bg-active"
          />
        </motion.div>
        {TABS.map((tab, index) => {
          const active = activeTab === tab.id;
          const className = `relative z-10 flex-1 rounded-full px-5 py-1.5 text-center text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EDEAE6] ${
            active
              ? "text-[#EDEAE6]"
              : "text-[#A29E9A] data-[fluid-hover-active]:text-[#EDEAE6]"
          }`;

          if (tab.id === "join" && LUMA_EVENT_SLUG) {
            return (
              <a
                key={tab.id}
                ref={navItemRefs[index]}
                id={`${panelId}-${tab.id}`}
                href={`https://luma.com/${LUMA_EVENT_SLUG}`}
                target="_blank"
                rel="noopener noreferrer"
                data-sound="tab"
                aria-label="Join on Luma (opens in a new tab)"
                className={className}
              >
                {tab.label}
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              ref={navItemRefs[index]}
              id={`${panelId}-${tab.id}`}
              type="button"
              aria-expanded={active}
              aria-controls={panelId}
              aria-haspopup="dialog"
              data-sound="tab"
              onClick={() => active ? closePanel() : setActiveTab(tab.id)}
              className={className}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
