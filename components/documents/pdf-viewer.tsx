"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Document as PDFDocument, Page as PDFPage, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// worker FIX (para que sea compatible con Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Tipo corregido
export type PDFFile = string | File | Blob | { data: Uint8Array } | null;

export interface PDFViewerProps {
  file?: PDFFile;
  isCompiling?: boolean;
  onCompile?: () => void;
}

export function PDFViewer({
  file = null,
  isCompiling = false,
  onCompile,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.9);
  const [rotate, setRotate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedFile = useMemo(() => {
    if (!file) return null;
    if (file instanceof Uint8Array) return { data: file };
    return file;
  }, [file]);

  const [blobState, setBlobState] = useState({ file: null as PDFFile, url: "" });

  // Patrón de sincronización de props de React: 
  // En lugar de useEffect para el setState, sincronizamos durante el render
  if (file !== blobState.file) {
    let newUrl = "";
    if (typeof normalizedFile === "string") {
      newUrl = normalizedFile;
    } else if (normalizedFile && typeof normalizedFile === "object" && "data" in normalizedFile) {
      const blob = new Blob([normalizedFile.data.buffer as ArrayBuffer], { type: "application/pdf" });
      newUrl = URL.createObjectURL(blob);
    }
    
    // Revocar el URL anterior si existía uno local
    if (blobState.url && typeof blobState.file !== "string" && blobState.file !== null) {
      URL.revokeObjectURL(blobState.url);
    }

    setBlobState({ file, url: newUrl });
  }

  // Ref para asegurar que el efecto de limpieza siempre tenga el valor más reciente sin ser una dependencia
  const blobStateRef = useRef(blobState);
  useEffect(() => {
    blobStateRef.current = blobState;
  }, [blobState]);

  // Solo para limpieza en desmontaje final
  useEffect(() => {
    return () => {
      const { file: f, url: u } = blobStateRef.current;
      if (u && typeof f !== "string" && f !== null) {
        URL.revokeObjectURL(u);
      }
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages ?? 1));
  };

  const handleDownload = useCallback(() => {
    if (!blobState.url) return;
    const link = document.createElement("a");
    link.href = blobState.url;
    link.download = "cherry_research.pdf";
    link.click();
  }, [blobState.url]);

  const handlePrint = useCallback(() => {
    if (!blobState.url) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobState.url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    };
  }, [blobState.url]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Viewer Toolbar (Floating Glass) */}
      <div className="flex items-center justify-between px-6 py-2 bg-white/2 backdrop-blur-3xl border-b border-white/5 z-20 h-16">
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-white/5 text-muted-foreground/30 hover:text-white transition-all"
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.4))}
            disabled={!normalizedFile}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <div className="h-3 w-px bg-white/5" />
          <span className="text-[9px] font-mono font-black w-10 text-center text-primary tracking-widest opacity-80">
            {Math.round(scale * 100)}%
          </span>
          <div className="h-3 w-px bg-white/5" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-white/5 text-muted-foreground/30 hover:text-white transition-all"
            onClick={() => setScale((s) => Math.min(s + 0.1, 3))}
            disabled={!normalizedFile}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-4 bg-black/40 px-3 py-1 rounded-xl border border-white/5 shadow-inner">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-white/5 text-muted-foreground/30 hover:text-white"
            onClick={() => changePage(-1)}
            disabled={!normalizedFile || pageNumber <= 1}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
            <span className="text-primary">{pageNumber}</span>
            <span className="opacity-10">/</span>
            <span>{numPages ?? "?"}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-white/5 text-muted-foreground/30 hover:text-white"
            onClick={() => changePage(1)}
            disabled={!normalizedFile || (numPages !== null && pageNumber >= numPages)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-white/5 text-muted-foreground/20 hover:text-white transition-all"
            onClick={() => setRotate((r) => (r + 90) % 360)}
            disabled={!normalizedFile}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-white/5 text-muted-foreground/20 hover:text-white"
            onClick={handlePrint}
            disabled={!normalizedFile}
          >
            <Printer className="h-3 w-3" />
          </Button>
          <div className="h-4 w-px bg-white/5 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10"
            onClick={handleDownload}
            disabled={!normalizedFile}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-12 flex justify-center bg-black custom-scrollbar relative">
        {/* Compilation Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="h-14 w-14 text-primary animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary fill-primary animate-pulse blur-[1px]" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.6em] animate-pulse">
                  Sincronizando
                </p>
                <div className="h-0.5 w-12 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(210,4,45,0.8)]" />
              </div>
            </div>
          </div>
        )}

        {normalizedFile ? (
          <div className="bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm relative transition-all duration-1000 border border-white/5">
            <PDFDocument
              file={normalizedFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" /></div>}
              error={<div className="p-20 text-destructive text-center"><AlertCircle className="h-8 w-8 mx-auto mb-4" /> Error en renderizado PDF</div>}
            >
              <PDFPage
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotate}
                className="shadow-3xl"
              />
            </PDFDocument>
          </div>
        ) : (
          <div className="w-full max-w-2xl aspect-[1/1.41] glass-panel rounded-5xl relative flex flex-col items-center justify-center p-20 text-center border-white/5 bg-white/2 transition-all duration-1000">
            <div className="space-y-8">
              <div className="w-24 h-24 bg-white/5 rounded-4xl flex items-center justify-center text-primary/30 mx-auto border border-white/5 shadow-inner">
                <Zap className="h-10 w-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white tracking-widest uppercase italic">
                  Vista Previa
                </h3>
                <p className="text-muted-foreground/40 font-medium leading-relaxed max-w-[280px] text-[11px] mx-auto">
                  Compila tu proyecto para visualizar el documento PDF actualizado.
                </p>
              </div>
              <Button
                onClick={onCompile}
                disabled={isCompiling}
                className="rounded-2xl font-black h-12 px-12 bg-primary text-white shadow-2xl shadow-primary/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] border-none"
              >
                {isCompiling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Compilar PDF"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute bottom-10 right-10 h-14 w-14 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl text-white/40 hover:text-white hover:bg-white/10 z-40 transition-all active:scale-90"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(210, 4, 45, 0.3);
        }
        .react-pdf__Page__canvas {
          margin: 0 auto;
          filter: drop-shadow(0 0 30px rgba(0,0,0,0.5));
        }
      `}</style>
    </div>
  );
}
