"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ProjectSidebar } from "@/components/dashboard/project-sidebar";
import { 
  Sparkles, 
  Send, 
  FileCode, 
  Plus, 
  Code,
  Loader2,
  Save,
  CheckCircle2,
  MoreVertical,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocuments, getDocument, updateDocument } from "@/actions/documents";
import { getConversations, getConversation, createConversation, sendMessage } from "@/actions/conversations";
import { compileProject } from "@/actions/compiler";
import { Document, Conversation, Message } from "@/lib/schemas";
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

// Dynamic imports for browser-only components to avoid SSR issues
const LatexEditor = dynamic(() => import("@/components/editor/latex-editor").then(mod => mod.LatexEditor), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-[#FCFDFF] text-secondary font-bold">Cargando Editor Maestro...</div>
});

const PDFViewer = dynamic(() => import("@/components/documents/pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" />
});

export default function UnifiedWorkspace() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"files" | "chat" | "settings">("chat");
  const [editorMode, setEditorMode] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  
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

  const [isPending, startTransition] = useTransition();

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
      
      // Select first conversation by default if none active
      if (convs.length > 0 && !activeConv) {
        handleSelectConversation(convs[0].id);
      } else if (convs.length === 0) {
        // Option: Create a default one if needed, or leave empty
      }
    } catch {
      sileo.error({ title: "Error", description: "No se pudieron cargar las conversaciones" });
    } finally {
      setIsLoadingChats(false);
    }
  }, [projectId, activeConv]);

  useEffect(() => {
    loadDocuments();
    loadConversations();
  }, [loadDocuments, loadConversations]);

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
    startTransition(async () => {
      const result = await createConversation(projectId, "Nueva Investigación");
      if (result.errors.length === 0 && result.data) {
        setConversations(prev => [result.data!, ...prev]);
        setActiveConv(result.data!);
        setMessages([]);
        sileo.success({ title: "Éxito", description: "Conversación creada" });
      }
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConv || isPending) return;

    const userMessageContent = messageInput.trim();
    setMessageInput("");

    // Optimistic Update
    const tempId = Math.random().toString();
    const optimisticMessage: Message = {
      id: tempId,
      role: "user",
      content: userMessageContent,
      conversationId: activeConv.id,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    startTransition(async () => {
      const result = await sendMessage(activeConv.id, userMessageContent);
      
      if (result.errors.length > 0) {
        sileo.error({ title: "Error", description: result.errors[0] });
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        // Refresh full history to get real IDs and assistant response
        const updatedConv = await getConversation(activeConv.id);
        if (updatedConv) {
          setMessages(updatedConv.messages || []);
        }
      }
    });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      // 1. Auto-save if editing
      if (editorMode && activeDoc) {
        await updateDocument(activeDoc.id, undefined, content);
      }

      // 2. Compile
      const result = await compileProject(projectId);
      
      if (result.errors.length > 0) {
        sileo.error({ title: "Error de Compilación", description: result.errors[0] });
      } else if (result.pdfBase64) {
        // Convert base64 to Uint8Array for react-pdf
        const binaryString = window.atob(result.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        setPdfFile({ data: bytes });
        sileo.success({ title: "Compilación Exitosa", description: "El PDF ha sido actualizado" });
      }
    } catch (err) {
      console.error("Compilation error:", err);
      sileo.error({ title: "Error", description: "Ocurrió un problema inesperado al compilar" });
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
        sileo.success({ title: "Guardado", description: "Cambios persistidos correctamente" });
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Project Navigation Sidebar */}
      <ProjectSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Secondary Sidebar Content (Files/Conversations) */}
      <div className="w-[300px] bg-[#F9FAFB] border-r border-muted/50 flex flex-col">
        <div className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#9CA3AF] mb-4">
            {activeTab === "files" ? "Archivos del Proyecto" : activeTab === "chat" ? "Conversaciones IA" : "Configuración"}
          </h2>
          
          {activeTab === "files" && (
            <div className="space-y-2">
              <Button 
                onClick={() => setIsCreateDocOpen(true)}
                variant="outline" 
                className="w-full justify-start gap-2 rounded-xl border-dashed py-6 hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="h-4 w-4" />
                Nuevo Archivo
              </Button>
              <div className="pt-4 space-y-1">
                {isLoadingDocs ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
                  ))
                ) : (
                  documents.map((doc: Document) => (
                    <div key={doc.id} className="group relative">
                      <button 
                        onClick={() => handleSelectDocument(doc.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeDoc?.id === doc.id ? "bg-white shadow-sm text-primary" : "hover:bg-white text-secondary hover:text-primary"
                        }`}
                      >
                        <FileCode className={`h-4 w-4 shrink-0 ${activeDoc?.id === doc.id ? "text-primary" : ""}`} />
                        <span className="text-sm font-bold flex-1 text-left truncate pr-6">{doc.title}</span>
                      </button>
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-none min-w-[120px] p-1">
                            <DropdownMenuItem 
                              onClick={() => setDocToDelete(doc)}
                              className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2 font-bold rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
            <div className="space-y-2">
              <Button 
                onClick={handleCreateConversation}
                disabled={isPending}
                className="w-full justify-start gap-2 rounded-xl py-6 shadow-lg shadow-primary/10 transition-all"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Nueva Conversación
              </Button>
              <div className="pt-4 space-y-1">
                {isLoadingChats ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-20 w-full bg-muted/10 animate-pulse rounded-2xl" />
                  ))
                ) : conversations.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest">No hay conversaciones</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button 
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full flex flex-col gap-1 p-4 rounded-2xl transition-all text-left ${
                        activeConv?.id === conv.id ? "bg-white shadow-sm border border-primary/10" : "hover:bg-white/50 text-secondary"
                      }`}
                    >
                      {activeConv?.id === conv.id && (
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Activa ahora</span>
                      )}
                      <span className={`text-sm font-bold truncate ${activeConv?.id === conv.id ? "text-[#111827]" : ""}`}>
                        {conv.title}
                      </span>
                      <span className="text-[11px] font-medium opacity-60">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Workspace (AI Chat + PDF | Editor) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Workspace Header */}
        <header className="h-16 border-b border-muted/50 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black text-[#111827]">Workspace</h1>
            <div className="h-4 w-px bg-muted" />
            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary">Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/5 px-2 py-0.5 rounded-full">Lista de Cherry</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setEditorMode(!editorMode)}
              variant={editorMode ? "secondary" : "ghost"}
              className="rounded-xl font-bold gap-2"
            >
              <Code className="h-4 w-4" />
              {editorMode ? "Volver al Chat" : "Modo Editor"}
            </Button>
            
            {editorMode && (
              <Button 
                onClick={handleSave}
                disabled={isPending}
                variant="outline"
                className="rounded-xl font-bold gap-2 border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </Button>
            )}

            <Button 
              onClick={handleCompile}
              disabled={isCompiling || isPending}
              className="rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all bg-primary"
            >
              {isCompiling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Compilar
            </Button>
          </div>
        </header>

        {/* Dynamic Panel Area */}
        <div className="flex-1 flex overflow-hidden">
          {editorMode ? (
            /* EDITOR MODE */
            <div className="flex-1 flex flex-col bg-[#FCFDFF]">
              <div className="p-4 bg-muted/20 border-b border-muted/50 flex items-center justify-between">
                <span className="text-xs font-black text-secondary uppercase tracking-widest pl-4">
                  Editando: {activeDoc?.title || "main.tex"}
                </span>
              </div>
              <LatexEditor 
                value={content}
                onChange={(v: string | undefined) => setContent(v || "")}
                className="flex-1"
              />
            </div>
          ) : (
            /* AI-FIRST MODE (CHAT) */
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Container */}
              <div className="flex-1 overflow-y-auto p-12 space-y-10">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                    <Sparkles className="h-10 w-10 text-primary" />
                    <p className="text-sm font-bold uppercase tracking-widest">¿En qué puedo ayudarte hoy?</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={msg.id || i} className="flex gap-6 max-w-4xl mx-auto group">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:-rotate-6 ${
                        msg.role === "assistant" ? "bg-primary text-white shadow-primary/20" : "bg-muted text-secondary"
                      }`}>
                        {msg.role === "assistant" ? <Sparkles className="h-5 w-5" /> : <div className="font-black text-xs">U</div>}
                      </div>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          msg.role === "assistant" ? "text-primary" : "text-secondary"
                        }`}>
                          {msg.role === "assistant" ? "Siri de Cherry" : "Tú"}
                        </div>
                        <MarkdownRenderer 
                          content={msg.content}
                          className="text-lg font-medium"
                        />
                        {msg.role === "assistant" && i === messages.length - 1 && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20">Aplicar cambios</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
              </div>

              {/* Message Input (Floating style) */}
              <div className="p-8 pb-12">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/5 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative bg-white border border-muted/50 rounded-[2rem] p-4 shadow-2xl flex items-end gap-3 ring-primary/5 focus-within:ring-4 transition-all"
                  >
                    <textarea 
                      placeholder="Instruye a la IA para modificar tu investigación..."
                      rows={1}
                      className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-md font-medium px-4 py-2 max-h-40 outline-none"
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
                      disabled={isPending || !messageInput.trim()}
                      className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all bg-primary"
                    >
                      {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* 4. PDF PREVIEW (Omnipresent Right Panel) */}
          <div className="w-[45%] h-full border-l border-muted/50">
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
