"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
      <div className="h-screen overflow-hidden bg-background">
        <main className="h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
