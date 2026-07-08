"use client";

import { useState } from "react";
import { EditorToolbar } from "@/components/documents/editor-toolbar";
import { PDFViewer } from "@/components/documents/pdf-viewer";
import { 
  ChevronLeft, 
  MessageSquare, 
  Sparkles, 
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditorPage() {
  const params = useParams();
  const [showChat, setShowChat] = useState(false);
  const [content, setContent] = useState(`\\documentclass[journal]{IEEEtran}
\\usepackage[utf8]{inputenc}

\\title{Investigación Cuántica: Protocolos LaTeX}
\\author{Autor de Cherry}

\\begin{document}
\\maketitle

\\begin{abstract}
Este documento explora el uso de Cherry como el primer asistente de investigación agentic para LaTeX.
\\end{abstract}

\\section{Introducción}
Cherry no es solo un editor; es tu compañero de investigación.

\\end{document}`);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Editor Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-muted bg-[#F8FAFC]">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${params.id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm transition-all">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded-md">
              LaTeX File
            </span>
            <h2 className="text-lg font-black text-[#111827]">main.tex</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={showChat ? "secondary" : "ghost"} 
            onClick={() => setShowChat(!showChat)}
            className="rounded-xl font-bold gap-2 transition-all"
          >
            <Sparkles className={`h-4 w-4 ${showChat ? "text-primary animate-pulse" : ""}`} />
            Siri de Cherry
          </Button>
        </div>
      </div>

      <EditorToolbar />

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col relative bg-[#FCFDFF]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-10 font-mono text-sm resize-none focus:outline-none bg-transparent leading-relaxed text-[#1F2937]"
            spellCheck={false}
          />
          
          {/* Editor Stats Footer (Floating) */}
          <div className="absolute bottom-6 left-10 flex gap-6 bg-white/70 backdrop-blur-lg px-6 py-2 rounded-full border border-muted/50 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase">Líneas</span>
              <span className="text-xs font-bold">{content.split("\n").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase">Palabras</span>
              <span className="text-xs font-bold">{content.trim().split(/\s+/).length}</span>
            </div>
          </div>
        </div>

        {/* PDF Preview Area */}
        <div className="w-[45%] hidden md:block h-full">
          <PDFViewer />
        </div>

        {/* AI Chat Sidebar (Overlay/Slide-in) */}
        {showChat && (
          <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l border-muted shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-40 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-muted flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#111827]">Siri de Cherry</h3>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">IA de Investigación</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-texture">
              <div className="bg-muted/30 p-5 rounded-[1.5rem] rounded-tl-none border border-muted text-sm font-medium leading-relaxed">
                ¡Hola! Soy tu asistente de Cherry. Puedo ayudarte a escribir el abstract, corregir errores de LaTeX o incluso generar tablas complejas. ¿En qué trabajamos hoy?
              </div>
            </div>

            <div className="p-6 bg-white border-t border-muted">
              <div className="flex gap-3 relative">
                <input 
                  type="text" 
                  placeholder="Escribe una instrucción para la IA..." 
                  className="flex-1 bg-muted/30 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                />
                <Button className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl shadow-lg shadow-primary/20">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
