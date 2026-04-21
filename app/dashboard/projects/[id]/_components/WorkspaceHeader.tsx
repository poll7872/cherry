"use client";

import { 
  ChevronLeft, 
  Activity, 
  Layout, 
  Code, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/use-ui-store";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useProjectQuery } from "@/hooks/use-workspace-queries";

interface WorkspaceHeaderProps {
  projectId: string;
}

export function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const { isCompiling, compileWorkspace } = useWorkspaceStore();
  const { isSidebarOpen, toggleSidebar, editorMode, setEditorMode } = useUIStore();
  
  // TanStack Query
  const { data: project } = useProjectQuery(projectId);

  const handleCompile = async () => {
    await compileWorkspace(projectId);
  };

  return (
    <header className="h-16 border-b border-white/5 px-10 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
      <div className="flex items-center gap-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5 text-muted-foreground/30 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="h-4 w-px bg-white/5" />
        <h1 className="text-xs font-black text-white tracking-[0.3em] uppercase italic opacity-70">
          {project?.name || "CARGANDO..."}
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/5 text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
          <Activity className="h-2.5 w-2.5 text-primary animate-pulse" />
          Sincronizado
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-all border border-white/5",
            isSidebarOpen ? "bg-white/5 text-white" : "text-muted-foreground/30 hover:text-white"
          )}
        >
          <Layout className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-white/5" />

        <Button 
          onClick={() => setEditorMode(!editorMode)}
          variant="ghost"
          className={cn(
            "rounded-xl font-black h-9 px-6 transition-all border border-white/5 text-[10px] uppercase tracking-widest",
            editorMode ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-muted-foreground/50 hover:text-white hover:bg-white/5"
          )}
        >
          <Code className="h-3.5 w-3.5 mr-3" />
          {editorMode ? "Cerrar" : "Editor"}
        </Button>
        
        <Button 
          onClick={handleCompile}
          disabled={isCompiling}
          className="rounded-xl font-black h-9 px-8 shadow-xl hover:shadow-primary/20 transition-all active:scale-95 bg-primary text-white text-[10px] uppercase tracking-widest border-none"
        >
          <Zap className="h-3 w-3 mr-3 fill-white" />
          Compilar
        </Button>
      </div>
    </header>
  );
}
