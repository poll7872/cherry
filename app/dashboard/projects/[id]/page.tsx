"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Document } from "@/lib/schemas";
import { CreateDocumentDialog } from "@/components/documents/create-document-dialog";
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog";
import { WorkspaceSidebar } from "./_components/WorkspaceSidebar";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { EditorPanel } from "./_components/EditorPanel";
import { ChatPanel } from "./_components/ChatPanel";
import { PreviewPanel } from "./_components/PreviewPanel";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/lib/store/use-ui-store";

export default function UnifiedWorkspace() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  // UI Store
  const { editorMode } = useUIStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  
  useEffect(() => {
    // Diferir el montaje para evitar el aviso de renderizado en cascada síncrono
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleDeleteSuccess = () => {
    if (docToDelete) {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      setDocToDelete(null);
    }
  };

  if (!isMounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans antialiased selection:bg-primary/20 selection:text-white">
      <WorkspaceSidebar 
        projectId={projectId} 
        isMounted={isMounted}
        setIsCreateDocOpen={setIsCreateDocOpen}
        setDocToDelete={setDocToDelete}
      />

      {/* ZENITH MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
        <WorkspaceHeader projectId={projectId} />

        <div className="flex-1 flex overflow-hidden">
          {editorMode ? <EditorPanel /> : <ChatPanel />}
          <PreviewPanel projectId={projectId} />
        </div>
      </div>

      <CreateDocumentDialog 
        projectId={projectId}
        open={isCreateDocOpen}
        onOpenChange={setIsCreateDocOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["documents", projectId] })}
      />

      <DeleteDocumentDialog
        projectId={projectId}
        docId={docToDelete?.id || ""}
        docTitle={docToDelete?.title || ""}
        open={!!docToDelete}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
