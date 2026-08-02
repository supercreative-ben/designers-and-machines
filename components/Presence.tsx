"use client";

import { useEffect } from "react";

/** Sends a presence heartbeat while the tab is open, so the site can show
 * how many people are on it right now. One id per browser tab. */
export default function Presence() {
  useEffect(() => {
    let id = sessionStorage.getItem("presence-id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("presence-id", id);
    }

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      void fetch("/api/presence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    };

    beat();
    const interval = setInterval(beat, 25_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  return null;
}
