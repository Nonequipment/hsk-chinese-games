import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSK Mission — ศัพท์จีน 1,200 คำ",
  description: "เรียนและทบทวนคำศัพท์ HSK 4.0 ครบ 1,200 คำด้วยแผนปรับอัตโนมัติ",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
