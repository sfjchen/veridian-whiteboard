import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veridian Whiteboard",
  description: "Local-first AI math whiteboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
