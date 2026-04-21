"use client";

import { 
  FileCode, 
  Plus, 
  MessageSquareText, 
  Library, 
  Settings,
  MoreVertical,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/lib/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useUIStore } from "@/lib/store/use-ui-store";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useDocumentsQuery, useConversationsQuery, useCreateConversationMutation } from "@/hooks/use-workspace-queries";

interface WorkspaceSidebarProps {
  projectId: string;
  isMounted: boolean;
  setIsCreateDocOpen: (open: boolean) => void;
  setDocToDelete: (doc: Document | null) => void;
}

export function WorkspaceSidebar({ 
  projectId, 
  isMounted, 
  setIsCreateDocOpen, 
  setDocToDelete 
}: WorkspaceSidebarProps) {
  const { activeTab, isSidebarOpen, setActiveTab } = useUIStore();
  const { 
    activeDocId, activeConvId,
    setActiveDocId, setActiveConvId, setMessages
  } = useWorkspaceStore();

  // TanStack Queries
  const { data: documents = [], isLoading: isLoadingDocs } = useDocumentsQuery(projectId);
  const { data: conversations = [], isLoading: isLoadingChats } = useConversationsQuery(projectId);
  const createConvMutation = useCreateConversationMutation();

  const handleSelectDocument = (docId: string) => {
    setActiveDocId(docId);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
  };

  const handleCreateChat = async () => {
    const result = await createConvMutation.mutateAsync({ projectId, title: "Nueva Consulta" });
    if (result.data) {
      setActiveConvId(result.data.id);
      setMessages([]);
    }
  };

  return (
    <aside 
      className={cn(
        "bg-black border-r border-white/5 transition-all duration-700 ease-in-out flex flex-col overflow-hidden relative z-50",
        isSidebarOpen ? "w-[280px] opacity-100" : "w-0 opacity-0"
      )}
    >
      <div className="p-8 min-w-[280px] h-full flex flex-col bg-black">
        {/* Top Switcher Rail */}
        <div className="flex items-center justify-between mb-10 px-1">
          <Logo className="h-4 w-auto grayscale opacity-50" />
          <div className="flex gap-1.5 p-1 rounded-xl bg-white/2 border border-white/5 shadow-inner">
            <Button 
              onClick={() => setActiveTab("chat")}
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-500",
                activeTab === "chat" ? "bg-primary text-white shadow-lg" : "text-muted-foreground/30 hover:text-white"
              )}
            >
              <MessageSquareText className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setActiveTab("files")}
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-500",
                activeTab === "files" ? "bg-primary text-white shadow-lg" : "text-muted-foreground/30 hover:text-white"
              )}
            >
              <Library className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setActiveTab("settings")}
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-500",
                activeTab === "settings" ? "bg-primary text-white shadow-lg" : "text-muted-foreground/30 hover:text-white"
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mb-6 px-1">
          {!isMounted ? "Biblioteca" : activeTab === "files" ? "Biblioteca" : activeTab === "chat" ? "Asistente Cherry" : "Zenith Setup"}
        </h2>
        
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {activeTab === "files" && (
            <div className="space-y-6">
              <Button 
                onClick={() => setIsCreateDocOpen(true)}
                className="w-full justify-start gap-4 rounded-xl h-10 bg-white/3 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all shadow-inner group"
              >
                <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                Archivo
              </Button>
              <div className="space-y-1">
                {isLoadingDocs ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-10 w-full bg-white/1 animate-pulse rounded-xl" />
                  ))
                ) : (
                  documents.map((doc: Document) => (
                    <div key={doc.id} className="group relative">
                      <button 
                        onClick={() => handleSelectDocument(doc.id)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                          activeDocId === doc.id ? "bg-white/5 text-primary shadow-2xl border border-white/5" : "hover:bg-white/2 text-muted-foreground/40 hover:text-white"
                        }`}
                      >
                        <FileCode className={cn("h-3.5 w-3.5 shrink-0 transition-opacity", activeDocId === doc.id ? "opacity-100" : "opacity-20")} />
                        <span className="text-[11px] font-black flex-1 text-left truncate tracking-tight uppercase italic">{doc.title}</span>
                      </button>
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-white/5">
                              <MoreVertical className="h-3 w-3 text-muted-foreground/30" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border border-white/10 p-1 min-w-[140px] bg-card/95 backdrop-blur-xl">
                            <DropdownMenuItem 
                              onClick={() => setDocToDelete(doc)}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 font-black text-[9px] uppercase tracking-widest rounded-xl py-2"
                            >
                              <Trash2 className="h-3 w-3" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="space-y-6">
              <Button 
                onClick={handleCreateChat}
                disabled={createConvMutation.isPending}
                className="w-full justify-start gap-4 rounded-xl h-10 bg-white/3 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all shadow-inner group"
              >
                {createConvMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />}
                Nuevo chat
              </Button>
              <div className="space-y-1 pt-2">
                {isLoadingChats ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-16 w-full bg-white/1 animate-pulse rounded-xl" />
                  ))
                ) : (
                  conversations.map(conv => (
                    <button 
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full flex flex-col gap-1 p-3.5 rounded-xl transition-all duration-700 text-left group ${
                        activeConvId === conv.id ? "bg-white/5 border border-white/5 shadow-2xl" : "hover:bg-white/2 text-muted-foreground/40 hover:text-white"
                      }`}
                    >
                      <span className={`text-[11px] font-black truncate tracking-tight uppercase italic ${activeConvId === conv.id ? "text-white" : ""}`}>
                        {conv.title}
                      </span>
                      <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-20 mt-1">
                        Log: {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-mono uppercase tracking-[0.5em] text-muted-foreground">Zenith Kernel V0.1</span>
        </div>
      </div>
    </aside>
  );
}
