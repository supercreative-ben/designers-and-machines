"use client";

import { useEffect } from "react";
import { getModelContext, registerDirectoryTools, type ModelContext } from "@/lib/webmcp/register";

/** Available as soon as the homepage loads, without opening the Lineup tab. */
export default function WebMCP() {
  useEffect(() => {
    const context = getModelContext(
      document as Document & { modelContext?: ModelContext },
      navigator as Navigator & { modelContext?: ModelContext },
    );
    if (!context) return;
    let disposed = false;
    let registration: ReturnType<typeof registerDirectoryTools> | undefined;
    // Browsers without WebMCP do not download the directory/tool bundle.
    void import("@/lib/webmcp/tools").then(({ DIRECTORY_TOOLS }) => {
      if (!disposed) registration = registerDirectoryTools(context, DIRECTORY_TOOLS);
    }).catch((error) => console.warn("Unable to initialize Designers & Machines WebMCP", error));
    return () => {
      disposed = true;
      registration?.dispose();
    };
  }, []);
  return null;
}
