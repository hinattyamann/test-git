import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "test.git",
  description: "学生向けの過去問閲覧アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
