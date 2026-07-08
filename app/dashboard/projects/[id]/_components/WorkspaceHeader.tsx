"use client";

import { Activity, Layout, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/use-ui-store";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useProjectQuery } from "@/hooks/use-workspace-queries";

import { ThemeToggle } from "@/components/theme-toggle";

interface WorkspaceHeaderProps {
  projectId: string;
}

export function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const { isCompiling, compileWorkspace } = useWorkspaceStore();
  const { isSidebarOpen, toggleSidebar, editorMode, setEditorMode } =
    useUIStore();

  // TanStack Query
  const { data: project } = useProjectQuery(projectId);

  const handleCompile = async () => {
    await compileWorkspace(projectId);
  };

  return (
    <header className="h-16 border-b border-border px-10 flex items-center justify-between bg-card/60 backdrop-blur-xl z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-all border",
            isSidebarOpen
              ? "bg-black/5 dark:bg-white/5 border-transparent text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent hover:bg-black/5 dark:hover:bg-white/5",
          )}
        >
          <Layout className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-xs font-black tracking-[0.3em] uppercase italic opacity-70">
          {project?.name || "CARGANDO..."}
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-[8px] font-mono text-primary uppercase tracking-[0.2em]">
          <Activity className="h-2.5 w-2.5 animate-pulse" />
          Sincronizado
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="h-4 w-px bg-border" />

        <Button
          onClick={() => setEditorMode(!editorMode)}
          variant="ghost"
          className={cn(
            "rounded-xl font-black h-9 px-6 transition-all border border-white/5 text-[10px] uppercase tracking-widest",
            editorMode
              ? "bg-primary text-white shadow-lg shadow-primary/10"
              : "text-muted-foreground/50 hover:text-white hover:bg-white/5",
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
