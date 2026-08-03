import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import ClickSounds from "@/components/ClickSounds";
import Presence from "@/components/Presence";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#211e1c",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://designers-and-machines.vercel.app"),
  title: "Designers and Machines",
  description:
    "Monthly demo dinners in SF for designers who explore how we create with machines.",
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/icon-light.png", type: "image/png" },
      {
        url: "/icon-light.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/icon-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <ClickSounds />
        <Presence />
        <Analytics />
      </body>
    </html>
  );
}
