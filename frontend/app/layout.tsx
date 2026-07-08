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

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={cn(
      "antialiased", 
      outfit.variable, 
      jetbrainsMono.variable
    )}>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans overflow-x-hidden">
        <div className="noise-obsidian" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastNotification />
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

