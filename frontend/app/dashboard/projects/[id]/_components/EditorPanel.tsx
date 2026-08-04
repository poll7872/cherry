"use client";

import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useDocumentQuery, useDocumentsQuery } from "@/hooks/use-workspace-queries";
import { useEffect, useRef } from "react";

const LatexEditor = dynamic(
  () =>
    import("@/components/editor/latex-editor").then((mod) => mod.LatexEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground font-sans font-bold uppercase tracking-[0.3em] text-[10px] opacity-20">
        Sincronizando Editor...
      </div>
    ),
  },
);

interface EditorPanelProps {
  projectId: string;
}

export function EditorPanel({ projectId }: EditorPanelProps) {
  const { activeDocId, content, saveDocument, setContent, setActiveDocId } =
    useWorkspaceStore();

  // TanStack Query
  const { data: activeDoc } = useDocumentQuery(activeDocId);
  const { data: documents = [] } = useDocumentsQuery(projectId);

  // Referencia para rastrear qué documento está cargado actualmente
  const lastDocId = useRef<string | null>(null);

  // Si no hay documento activo, abrir el primero (preferir main.tex)
  useEffect(() => {
    if (!activeDocId && documents.length > 0) {
      const mainDoc =
        documents.find((doc) => doc.title === "main.tex") || documents[0];
      setActiveDocId(mainDoc.id);
    }
  }, [activeDocId, documents, setActiveDocId]);

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
          <FileText className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-mono font-bold text-muted-foreground/30 uppercase tracking-widest">
            Documento: {activeDoc?.title || "null.tex"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={saveDocument}
          className="font-black text-[9px] gap-2 uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 h-7"
        >
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
