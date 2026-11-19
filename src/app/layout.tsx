import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEJAK KINERJA AI",
  description: "Catat Hari Ini, Buktikan Kinerja.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
