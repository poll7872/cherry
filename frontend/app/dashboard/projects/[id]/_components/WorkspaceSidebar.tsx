"use client";

import {
  FileCode,
  Plus,
  MessageSquareText,
  Library,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, Conversation } from "@/lib/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUIStore } from "@/lib/store/use-ui-store";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import {
  useDocumentsQuery,
  useConversationsQuery,
} from "@/hooks/use-workspace-queries";
import { Logo } from "@/components/logo";

interface WorkspaceSidebarProps {
  projectId: string;
  isMounted: boolean;
  setIsCreateDocOpen: (open: boolean) => void;
  setIsCreateConvOpen: (open: boolean) => void;
  setDocToDelete: (doc: Document | null) => void;
  setConvToDelete: (conv: Conversation | null) => void;
}

export function WorkspaceSidebar({
  projectId,
  isMounted,
  setIsCreateDocOpen,
  setIsCreateConvOpen,
  setDocToDelete,
  setConvToDelete,
}: WorkspaceSidebarProps) {
  const { activeTab, isSidebarOpen, setActiveTab, setEditorMode } =
    useUIStore();
  const { activeDocId, activeConvId, setActiveDocId, setActiveConvId } =
    useWorkspaceStore();

  // TanStack Queries
  const { data: documents = [], isLoading: isLoadingDocs } =
    useDocumentsQuery(projectId);
  const { data: conversations = [], isLoading: isLoadingChats } =
    useConversationsQuery(projectId);

  const handleSelectDocument = (docId: string) => {
    setActiveDocId(docId);
    setEditorMode(true);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setEditorMode(false);
  };

  return (
    <aside
      className={cn(
        "bg-background border-r border-border transition-all duration-700 ease-in-out flex flex-col overflow-hidden relative z-50",
        isSidebarOpen ? "w-70 opacity-100" : "w-0 opacity-0",
      )}
    >
      <div className="p-8 min-w-70 h-full flex flex-col bg-background">
        <Link
          href="/dashboard"
          className="flex justify-center mb-4 items-center hover:opacity-80 transition-opacity"
        >
          <Logo className="h-10 w-24" />
        </Link>
        {/* Top Switcher Rail */}
        <div className="mb-10 px-1">
          <div className="flex gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-border shadow-inner w-full">
            <Button
              onClick={() => setActiveTab("chat")}
              variant="ghost"
              className={cn(
                "flex-1 h-8 rounded-lg transition-all duration-500 flex justify-center items-center",
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              <MessageSquareText className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setActiveTab("files")}
              variant="ghost"
              className={cn(
                "flex-1 h-8 rounded-lg transition-all duration-500 flex justify-center items-center",
                activeTab === "files"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              <Library className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 dark:text-muted-foreground/20 mb-6 px-1">
          {!isMounted
            ? "Biblioteca"
            : activeTab === "files"
              ? "Biblioteca"
              : "Asistente Cherry"}
        </h2>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {activeTab === "files" && (
            <div className="space-y-6">
              <Button
                onClick={() => setIsCreateDocOpen(true)}
                className="w-full justify-start gap-4 rounded-xl h-10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border border-border transition-all group"
              >
                <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                Archivo
              </Button>
              <div className="space-y-1">
                {isLoadingDocs
                  ? Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-full bg-black/5 dark:bg-white/5 animate-pulse rounded-xl"
                        />
                      ))
                  : documents.map((doc: Document) => (
                      <div key={doc.id} className="group relative">
                        <button
                          onClick={() => handleSelectDocument(doc.id)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                            activeDocId === doc.id
                              ? "bg-black/5 dark:bg-white/5 text-primary shadow-2xl border border-border"
                              : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <FileCode
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-opacity",
                              activeDocId === doc.id
                                ? "opacity-100"
                                : "opacity-40 dark:opacity-20",
                            )}
                          />
                          <span className="text-[11px] font-black flex-1 text-left truncate tracking-tight uppercase italic">
                            {doc.title}
                          </span>
                        </button>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                <MoreVertical className="h-3 w-3 text-muted-foreground/50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-2xl shadow-2xl border border-border p-1 min-w-35 bg-card/95 backdrop-blur-xl"
                            >
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
                    ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="space-y-6">
              <Button
                onClick={() => setIsCreateConvOpen(true)}
                className="w-full justify-start gap-4 rounded-xl h-10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[10px] text-muted-foreground uppercase tracking-[0.2em] border border-border transition-all group"
              >
                <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                Nuevo chat
              </Button>
              <div className="space-y-1 pt-2">
                {isLoadingChats
                  ? Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-16 w-full bg-black/5 dark:bg-white/5 animate-pulse rounded-xl"
                        />
                      ))
                  : conversations.map((conv) => (
                      <div key={conv.id} className="group relative">
                        <button
                          onClick={() => handleSelectConversation(conv.id)}
                          className={`w-full flex flex-col gap-1 p-3.5 pr-10 rounded-xl transition-all duration-700 text-left ${
                            activeConvId === conv.id
                              ? "bg-black/5 dark:bg-white/5 border border-border shadow-2xl"
                              : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`text-[11px] font-black truncate tracking-tight uppercase italic pr-2 ${activeConvId === conv.id ? "text-foreground" : ""}`}
                          >
                            {conv.title}
                          </span>
                          <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40 dark:opacity-20 mt-1">
                            Log: {new Date(conv.updatedAt).toLocaleDateString()}
                          </span>
                        </button>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                <MoreVertical className="h-3 w-3 text-muted-foreground/50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-2xl shadow-2xl border border-border p-1 min-w-35 bg-card/95 backdrop-blur-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => setConvToDelete(conv)}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 font-black text-[9px] uppercase tracking-widest rounded-xl py-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-mono uppercase tracking-[0.5em] text-muted-foreground">
            Cherry Beta V1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
