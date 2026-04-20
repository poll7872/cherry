import type { Metadata } from "next";
import "./globals.css";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastNotification } from "@/components/ui/ToastNotification";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cherry — Escritura Técnica de Precisión",
  description: "La plataforma de nivel producción para investigadores y profesionales que exigen excelencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(
      "antialiased", 
      outfit.variable, 
      jetbrainsMono.variable
    )}>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans overflow-x-hidden">
        <div className="noise-obsidian" />
        <ToastNotification />
        {children}
      </body>
    </html>
  );
}

