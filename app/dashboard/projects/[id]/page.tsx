"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  FileCode, 
  Plus, 
  Code,
  Loader2,
  Save,
  MoreVertical,
  Trash2,
  Activity,
  Cpu,
  Zap,
  Library,
  MessageSquareText,
  Settings,
  ChevronLeft,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocuments, getDocument, updateDocument } from "@/actions/documents";
import { getConversations, getConversation, createConversation } from "@/actions/conversations";
import { getProject } from "@/actions/projects";
import { compileProject } from "@/actions/compiler";
import { Document, Conversation, Message } from "@/lib/schemas";
import { Project } from "@/lib/types";
import { sileo } from "sileo";
import { CreateDocumentDialog } from "@/components/documents/create-document-dialog";
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import type { PDFFile } from "@/components/documents/pdf-viewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import Link from "next/link";

// Dynamic imports for browser-only components to avoid SSR issues
const LatexEditor = dynamic(() => import("@/components/editor/latex-editor").then(mod => mod.LatexEditor), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground font-sans font-bold uppercase tracking-[0.3em] text-[10px] opacity-20">Sincronizando Editor...</div>
});

const PDFViewer = dynamic(() => import("@/components/documents/pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/2 animate-pulse" />
});

export default function UnifiedWorkspace() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"files" | "chat" | "settings">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  
  // Project Data
  const [project, setProject] = useState<Project | null>(null);

  // Real Data State (Files)
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [pdfFile, setPdfFile] = useState<PDFFile>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Real Data State (IA)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingConv, setIsCreatingConv] = useState(false);

  const [isPending, startTransition] = useTransition();

  // 0. Fetch Project
  const loadProject = useCallback(async () => {
    const data = await getProject(projectId);
    setProject(data);
  }, [projectId]);

  // 1. Fetch Documents
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getDocuments(projectId);
      setDocuments(docs);
      if (docs.length > 0 && !activeDoc) {
        const mainDoc = docs.find(d => d.title === "main.tex") || docs[0];
        handleSelectDocument(mainDoc.id);
      }
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron cargar los documentos" });
    } finally {
      setIsLoadingDocs(false);
    }
  }, [projectId, activeDoc]);

  // 2. Fetch Conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const convs = await getConversations(projectId);
      setConversations(convs);
      if (convs.length > 0 && !activeConv) {
        handleSelectConversation(convs[0].id);
      }
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron cargar las sesiones de IA" });
    } finally {
      setIsLoadingChats(false);
    }
  }, [projectId, activeConv]);

  useEffect(() => {
    setIsMounted(true);
    loadProject();
    loadDocuments();
    loadConversations();
  }, [loadProject, loadDocuments, loadConversations]);

  const handleSelectDocument = async (docId: string) => {
    startTransition(async () => {
      const fullDoc = await getDocument(docId);
      if (fullDoc) {
        setActiveDoc(fullDoc);
        setContent(fullDoc.content || "");
      }
    });
  };

  const handleSelectConversation = async (convId: string) => {
    startTransition(async () => {
      const fullConv = await getConversation(convId);
      if (fullConv) {
        setActiveConv(fullConv);
        setMessages(fullConv.messages || []);
      }
    });
  };

  const handleCreateConversation = async () => {
    setIsCreatingConv(true);
    try {
      const result = await createConversation(projectId, "Nueva Consulta");
      if (result.errors.length === 0 && result.data) {
        startTransition(() => {
          setConversations(prev => [result.data!, ...prev]);
          setActiveConv(result.data!);
          setMessages([]);
        });
        sileo.success({ title: "Sesión creada", description: "Nueva consulta iniciada" });
      }
    } finally {
      setIsCreatingConv(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConv || isPending) return;

    const userMessageContent = messageInput.trim();
    setMessageInput("");

    const userTempId = "user-" + Math.random().toString();
    const assistantTempId = "assistant-" + Math.random().toString();

    const optimisticUserMessage: Message = {
      id: userTempId,
      role: "user",
      content: userMessageContent,
      conversationId: activeConv.id,
      timestamp: new Date().toISOString(),
    };

    const optimisticAssistantMessage: Message = {
      id: assistantTempId,
      role: "assistant",
      content: "",
      conversationId: activeConv.id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage, optimisticAssistantMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, content: userMessageContent }),
      });

      if (!response.ok) {
        sileo.error({ title: "Error", description: "Fallo en el servidor de IA" });
        setMessages((prev) => prev.filter((m) => m.id !== assistantTempId && m.id !== userTempId));
        setIsSending(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsSending(false);
        return;
      }

      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantTempId ? { ...m, content: m.content + chunk } : m))
          );
        }
      }

      const updatedConv = await getConversation(activeConv.id);
      if (updatedConv) {
        setMessages(updatedConv.messages || []);
      }
    } catch (err) {
      console.error(err);
      sileo.error({ title: "Error Crítico", description: "Fallo de conexión inesperado" });
    } finally {
      setIsSending(false);
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      if (editorMode && activeDoc) {
        await updateDocument(activeDoc.id, undefined, content);
      }
      const result = await compileProject(projectId);
      if (result.errors.length > 0) {
        sileo.error({ title: "Error de Compilación", description: result.errors[0] });
      } else if (result.pdfBase64) {
        const binaryString = window.atob(result.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        setPdfFile({ data: bytes });
        sileo.success({ title: "Compilación Correcta", description: "El visor PDF ha sido actualizado" });
      }
    } catch {
      sileo.error({ title: "Error", description: "Ocurrió un problema al sincronizar el paper" });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = async () => {
    if (!activeDoc) return;
    startTransition(async () => {
      const result = await updateDocument(activeDoc.id, undefined, content);
      if (result.errors.length > 0) {
        sileo.error({ title: "Error al guardar", description: result.errors[0] });
      } else {
        sileo.success({ title: "Cambios guardados", description: "Sincronización de documento completa" });
      }
    });
  };

  const handleDeleteSuccess = () => {
    const remainingDocs = documents.filter(d => d.id !== docToDelete?.id);
    if (activeDoc?.id === docToDelete?.id) {
      if (remainingDocs.length > 0) {
        const nextDoc = remainingDocs.find(d => d.title === "main.tex") || remainingDocs[0];
        handleSelectDocument(nextDoc.id);
      } else {
        setActiveDoc(null);
        setContent("");
      }
    }
    setDocuments(remainingDocs);
    setDocToDelete(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans antialiased selection:bg-primary/20 selection:text-white">
      {/* ZENITH UNIFIED SIDEBAR */}
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
                            activeDoc?.id === doc.id ? "bg-white/5 text-primary shadow-2xl border border-white/5" : "hover:bg-white/2 text-muted-foreground/40 hover:text-white"
                          }`}
                        >
                          <FileCode className={cn("h-3.5 w-3.5 shrink-0 transition-opacity", activeDoc?.id === doc.id ? "opacity-100" : "opacity-20")} />
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
                  onClick={handleCreateConversation}
                  disabled={isCreatingConv}
                  className="w-full justify-start gap-4 rounded-xl h-10 bg-white/3 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all shadow-inner group"
                >
                  {isCreatingConv ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />}
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
                          activeConv?.id === conv.id ? "bg-white/5 border border-white/5 shadow-2xl" : "hover:bg-white/2 text-muted-foreground/40 hover:text-white"
                        }`}
                      >
                        <span className={`text-[11px] font-black truncate tracking-tight uppercase italic ${activeConv?.id === conv.id ? "text-white" : ""}`}>
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

      {/* ZENITH MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
        {/* Simplified Header */}
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
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
              disabled={isCompiling || isPending}
              className="rounded-xl font-black h-9 px-8 shadow-xl hover:shadow-primary/20 transition-all active:scale-95 bg-primary text-white text-[10px] uppercase tracking-widest border-none"
            >
              <Zap className="h-3 w-3 mr-3 fill-white" />
              Compilar
            </Button>
          </div>
        </header>

        {/* Dynamic Workspace Panels */}
        <div className="flex-1 flex overflow-hidden">
          {editorMode ? (
            /* EDITOR MODE */
            <div className="flex-1 flex flex-col bg-black">
              <div className="px-8 py-2 bg-white/2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/30 uppercase tracking-widest">
                    Kernel: {activeDoc?.title || "null.tex"}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSave} className="font-black text-[9px] gap-2 uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 h-7">
                  <Save className="h-3 w-3" /> Guardar
                </Button>
              </div>
              <LatexEditor 
                value={content}
                onChange={(v: string | undefined) => setContent(v || "")}
                className="flex-1"
              />
            </div>
          ) : (
            /* AI-FIRST MODE (CHAT) */
            <div className="flex-1 flex flex-col transition-colors duration-700 bg-white/3">
              {/* Chat Container */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-10">
                    <Sparkles className="h-10 w-10 text-primary" />
                    <p className="text-xl font-black tracking-[0.4em] italic uppercase text-white">¿Cómo puedo ayudarte hoy?</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={msg.id || i} className="flex gap-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-2xl transition-all duration-700 ${
                        msg.role === "assistant" ? "bg-primary text-white scale-110" : "bg-white/5 text-muted-foreground/30"
                      }`}>
                        {msg.role === "assistant" ? <Sparkles className="h-4 w-4" /> : <p className="font-black text-[9px]">S1</p>}
                      </div>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className={`text-[8px] font-black uppercase tracking-[0.4em] ${
                          msg.role === "assistant" ? "text-primary" : "text-muted-foreground/20"
                        }`}>
                          {msg.role === "assistant" ? "Cherry" : "Tú"}
                        </div>
                        <div className={cn(
                          "py-2 transition-all duration-700",
                          msg.role === "assistant" ? "" : ""
                        )}>
                          {msg.role === "assistant" && msg.content === "" ? (
                            <div className="flex items-center gap-3 py-2 text-primary/40 animate-pulse">
                              <div className="flex gap-1">
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Cherry está pensando...</span>
                            </div>
                          ) : (
                            <MarkdownRenderer 
                              content={msg.content}
                              className="text-base leading-relaxed font-medium tracking-tight text-white/90 prose-invert prose-p:text-white/80 prose-strong:text-white prose-strong:font-black"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
              </div>

              {/* Message Input (Focused Bar) */}
              <div className="p-10 pb-16">
                <div className="max-w-4xl mx-auto">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="glass-panel border-white/10 p-3 rounded-4xl shadow-2xl backdrop-blur-3xl flex items-end gap-3 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-700"
                  >
                    <textarea 
                      placeholder="Empieza tu paper de investigación..."
                      rows={1}
                      className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-base font-medium px-4 py-3 max-h-40 outline-none text-white placeholder:text-muted-foreground/20 leading-relaxed"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      type="submit"
                      disabled={isSending || !messageInput.trim()}
                      className="h-10 w-10 rounded-2xl shadow-xl hover:shadow-primary/30 active:scale-90 transition-all bg-primary text-white border-none"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* 4. PDF PREVIEW (Right Panel) */}
          <div className="w-[45%] h-full border-l border-white/5 bg-black">
            <PDFViewer 
              file={pdfFile} 
              isCompiling={isCompiling} 
              onCompile={handleCompile}
            />
          </div>
        </div>
      </div>

      <CreateDocumentDialog 
        projectId={projectId}
        open={isCreateDocOpen}
        onOpenChange={setIsCreateDocOpen}
        onSuccess={loadDocuments}
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
