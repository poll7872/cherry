"use client";

import { Cpu, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useDocumentQuery } from "@/hooks/use-workspace-queries";
import { useEffect, useRef } from "react";

const LatexEditor = dynamic(() => import("@/components/editor/latex-editor").then(mod => mod.LatexEditor), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground font-sans font-bold uppercase tracking-[0.3em] text-[10px] opacity-20">Sincronizando Editor...</div>
});

export function EditorPanel() {
  const { activeDocId, content, saveDocument, setContent } = useWorkspaceStore();
  
  // TanStack Query
  const { data: activeDoc } = useDocumentQuery(activeDocId);
  
  // Referencia para rastrear qué documento está cargado actualmente
  const lastDocId = useRef<string | null>(null);
  
  // Sincronizar contenido inicial cuando cambia el documento activo
  useEffect(() => {
    if (activeDoc && activeDoc.id !== lastDocId.current) {
      setContent(activeDoc.content || "");
      lastDocId.current = activeDoc.id;
    }
  }, [activeDoc, setContent]);

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="px-8 py-2 bg-card/60 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-mono font-bold text-muted-foreground/30 uppercase tracking-widest">
            Kernel: {activeDoc?.title || "null.tex"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={saveDocument} className="font-black text-[9px] gap-2 uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 h-7">
          <Save className="h-3 w-3" /> Guardar
        </Button>
      </div>
      <LatexEditor 
        value={content}
        onChange={(v: string | undefined) => setContent(v || "")}
        className="flex-1"
      />
    </div>
  );
}
