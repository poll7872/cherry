"use client";

import { 
  Settings, 
  Search,
  ChevronLeft,
  Files,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectSidebarProps {
  activeTab: "files" | "chat" | "settings";
  onTabChange: (tab: "files" | "chat" | "settings") => void;
}

export function ProjectSidebar({ activeTab, onTabChange }: ProjectSidebarProps) {
  return (
    <div className="w-[70px] flex flex-col items-center py-6 bg-white border-r border-muted/50 h-full gap-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/5 text-secondary hover:text-primary transition-all">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </Link>

      <div className="flex-1 flex flex-col gap-4">
        <Button
          onClick={() => onTabChange("chat")}
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-12 w-12 rounded-2xl transition-all",
            activeTab === "chat" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:bg-muted"
          )}
        >
          <Zap className="h-6 w-6" />
        </Button>

        <Button
          onClick={() => onTabChange("files")}
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-12 w-12 rounded-2xl transition-all",
            activeTab === "files" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:bg-muted"
          )}
        >
          <Files className="h-6 w-6" />
        </Button>

        <Button
          onClick={() => onTabChange("settings")}
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-12 w-12 rounded-2xl transition-all",
            activeTab === "settings" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:bg-muted"
          )}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-secondary hover:bg-muted">
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}
