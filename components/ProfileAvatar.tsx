"use client";

import { useState } from "react";
import { avatarUrl } from "@/data/events";

/** Every avatar has a visible initials fallback, including failed local loads. */
export default function ProfileAvatar({
  name, handle, src, size, className = "",
}: {
  name: string;
  handle?: string | null;
  src?: string;
  size: number;
  className?: string;
}) {
  const source = src ?? (handle ? avatarUrl(handle) : null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#55524F] text-[#EDEAE6] ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.4) }}
      role="img"
      aria-label={name}
    >
      <span aria-hidden>{name.trim().charAt(0).toUpperCase() || "?"}</span>
      {source && failedSource !== source && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedSource(source)}
        />
      )}
    </span>
  );
}
