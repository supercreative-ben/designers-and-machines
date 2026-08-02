import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Who am I? Also tells the client whether X sign-in is configured. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({
    configured: Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET),
    user,
  });
}
