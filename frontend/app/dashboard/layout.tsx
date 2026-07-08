"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Detect if we are in a project workspace by checking for projects/[id] pattern
  const isProjectWorkspace = pathname.includes("/dashboard/projects/") && pathname.split("/").length >= 4;

  if (isProjectWorkspace) {
    return (
      <div className="h-screen overflow-hidden bg-background relative">
        <main className="h-full overflow-hidden relative z-10">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background font-sans antialiased overflow-hidden flex flex-col">
      {/* GLOBAL BACKGROUND BRAND MARK */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <h1 className="text-[25vw] font-black leading-none tracking-tighter text-white/1.5 uppercase italic">
          Cherry
        </h1>
      </div>

      <DashboardNav />
      
      <main className="flex-1 relative z-10 pt-24 animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}
