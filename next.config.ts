import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "unavatar.io" }],
    // Our own image proxies use query strings, which next/image blocks
    // unless explicitly allowed.
    localPatterns: [
      { pathname: "/api/og" },
      { pathname: "/api/avatar" },
      { pathname: "/projects/**" },
    ],
  },
};

export default nextConfig;
