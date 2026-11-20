import { NextResponse } from "next/server";
import { LUMA_EVENT_SLUG } from "@/data/site";

/**
 * Live spots-remaining for the next dinner, from Lu.ma's public event API
 * (the same JSON the lu.ma event page loads — no API key required).
 */
export async function GET() {
  if (!LUMA_EVENT_SLUG) {
    return NextResponse.json({ spotsRemaining: null, soldOut: false });
  }
  try {
    const res = await fetch(
      `https://api.lu.ma/url?url=${encodeURIComponent(LUMA_EVENT_SLUG)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`luma ${res.status}`);
    const data = await res.json();
    const info = data?.data?.ticket_info ?? {};
    const soldOut =
      info.is_sold_out === true ||
      (typeof data?.data?.guest_count === "number" && data.data.guest_count > 50);
    return NextResponse.json(
      {
        spotsRemaining: soldOut
          ? 0
          : typeof info.spots_remaining === "number"
            ? info.spots_remaining
            : null,
        soldOut,
      },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ spotsRemaining: null, soldOut: false });
  }
}
