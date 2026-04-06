import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cherry",
  description: "Cherry application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}