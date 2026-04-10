"use client";

import { cn } from "@/lib/utils";
import { 
  FileText, 
  LayoutDashboard, 
  Star, 
  Trash2, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Mis Proyectos", href: "/dashboard/projects" },
  { icon: Star, label: "Favoritos", href: "/dashboard/favorites" },
  { icon: Trash2, label: "Papelera", href: "/dashboard/trash" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "relative h-screen bg-card transition-all duration-300 ease-in-out flex flex-col z-50",
        "shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-20 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="min-w-[40px] transition-transform hover:scale-110 duration-300">
            <Logo /> 
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isActive && "group-hover:text-primary transition-colors")} />
                {!collapsed && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto space-y-4">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-muted/30 transition-colors hover:bg-muted/50",
          collapsed ? "justify-center" : "px-4"
        )}>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold leading-none truncate">John Doe</p>
              <p className="text-[10px] text-muted-foreground truncate">Premium Account</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>
    </aside>
  );
}
