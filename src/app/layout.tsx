import type { Metadata } from "next";
import { Dancing_Script, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "Veridian",
  description: "AI math whiteboard — write, analyze mistakes, ask for hints.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dancingScript.variable}`}>
      <body>{children}</body>
    </html>
  );
}
