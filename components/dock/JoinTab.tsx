"use client";

import { LUMA_EMBED_URL } from "@/data/site";

export default function JoinTab() {
  if (!LUMA_EMBED_URL) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-8 pb-16 text-center">
        <p className="text-sm font-medium text-white">RSVP opens soon</p>
        <p className="text-sm leading-relaxed text-[#A5A19D]">
          The Lu.ma page for the next dinner isn&apos;t live yet. Check back
          shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full px-3 pb-16 pt-3">
      <iframe
        src={LUMA_EMBED_URL}
        loading="lazy"
        className="h-full w-full rounded-2xl border-0"
        allow="fullscreen; payment"
        aria-label="Lu.ma event"
      />
    </div>
  );
}
