import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ClickSounds from "@/components/ClickSounds";
import "./globals.css";

export const metadata: Metadata = {
  title: "Designers and Machines",
  description:
    "Monthly demo dinners in SF for designers who explore how we create with machines.",
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
        <Analytics />
      </body>
    </html>
  );
}
