import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ampersandSerif = Instrument_Serif({
  variable: "--font-ampersand",
  weight: "400",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${ampersandSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
