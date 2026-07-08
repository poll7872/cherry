"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Document, Conversation } from "@/lib/schemas";
import { CreateDocumentDialog } from "@/components/documents/create-document-dialog";
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog";
import { DeleteConversationDialog } from "@/components/conversations/delete-conversation-dialog";
import { CreateConversationDialog } from "@/components/conversations/create-conversation-dialog";
import { WorkspaceSidebar } from "./_components/WorkspaceSidebar";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { EditorPanel } from "./_components/EditorPanel";
import { ChatPanel } from "./_components/ChatPanel";
import { PreviewPanel } from "./_components/PreviewPanel";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/lib/store/use-ui-store";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";

export default function UnifiedWorkspace() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  // UI Store
  const { editorMode } = useUIStore();

  // Workspace Store
  const { 
    activeDocId, 
    setActiveDocId, 
    activeConvId, 
    setActiveConvId, 
    setMessages 
  } = useWorkspaceStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isCreateConvOpen, setIsCreateConvOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);
  
  useEffect(() => {
    // Diferir el montaje para evitar el aviso de renderizado en cascada síncrono
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleDeleteSuccess = () => {
    if (docToDelete) {
      if (activeDocId === docToDelete.id) {
        setActiveDocId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      setDocToDelete(null);
    }
  };

  const handleConversationDeleteSuccess = () => {
    if (convToDelete) {
      if (activeConvId === convToDelete.id) {
        setActiveConvId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });
      setConvToDelete(null);
    }
  };

  const handleConversationCreateSuccess = (newConvId: string) => {
    setActiveConvId(newConvId);
    setMessages([]);
    queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });
  };

  if (!isMounted) return <div className="h-screen w-screen bg-background" />;

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <WorkspaceSidebar 
        projectId={projectId} 
        isMounted={isMounted}
        setIsCreateDocOpen={setIsCreateDocOpen}
        setIsCreateConvOpen={setIsCreateConvOpen}
        setDocToDelete={setDocToDelete}
        setConvToDelete={setConvToDelete}
      />

      {/* ZENITH MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
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

      <DeleteConversationDialog
        projectId={projectId}
        convId={convToDelete?.id || ""}
        convTitle={convToDelete?.title || ""}
        open={!!convToDelete}
        onOpenChange={(open) => !open && setConvToDelete(null)}
        onSuccess={handleConversationDeleteSuccess}
      />

      <CreateConversationDialog
        projectId={projectId}
        open={isCreateConvOpen}
        onOpenChange={setIsCreateConvOpen}
        onSuccess={handleConversationCreateSuccess}
      />
    </div>
  );
}
