"use client";

import { useState, useCallback, useMemo } from "react";
import { Document as PDFDocument, Page as PDFPage, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// worker FIX (para que sea compatible con Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Tipo corregido (SIN Uint8Array directo)
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
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);

  // Normalización segura del file
  const normalizedFile = useMemo(() => {
    if (!file) return null;

    // Si por alguna razón llega como Uint8Array, lo adaptamos al objeto { data }
    if (file instanceof Uint8Array) {
      return { data: file };
    }

    return file;
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber((prev) =>
      Math.min(Math.max(1, prev + offset), numPages ?? 1),
    );
  };

  const handleDownload = useCallback(() => {
    if (typeof file === "string") {
      const link = document.createElement("a");
      link.href = file;
      link.download = "investigacion_cherry.pdf";
      link.click();
    }
  }, [file]);

  return (
    <div className="flex flex-col h-full bg-[#E5E7EB]/50 backdrop-blur-sm relative border-l border-muted/50 overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/60 border-b border-muted/50 z-20">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
            disabled={!normalizedFile}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-black w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
            disabled={!normalizedFile}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => changePage(-1)}
            disabled={!normalizedFile || pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-black">
            Pág. {pageNumber} de {numPages ?? "?"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => changePage(1)}
            disabled={
              !normalizedFile || (numPages !== null && pageNumber >= numPages)
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setRotate((r) => (r + 90) % 360)}
            disabled={!normalizedFile}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-muted mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            disabled={!normalizedFile}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-primary bg-primary/5 hover:bg-primary/10"
            onClick={handleDownload}
            disabled={!normalizedFile}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-muted/20 custom-scrollbar relative">
        {/* Compilation Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary/40 truncate" />
                </div>
              </div>
              <p className="text-sm font-black text-[#111827] uppercase tracking-widest">
                Renderizando PDF...
              </p>
            </div>
          </div>
        )}

        {normalizedFile ? (
          <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm relative transition-all duration-300">
            <PDFDocument
              file={normalizedFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-20 min-h-125 gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm font-bold text-secondary">
                    Cargando PDF...
                  </p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-20 min-h-125 gap-4">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <p className="text-sm font-bold text-destructive">
                    Error al cargar el PDF
                  </p>
                </div>
              }
            >
              <PDFPage
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotate}
                className="shadow-sm"
              />
            </PDFDocument>
          </div>
        ) : (
          <div className="w-full max-w-200 aspect-[1/1.41] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm relative flex flex-col items-center justify-center p-20 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto">
                <FileText className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#111827]">
                  Archivo main.tex
                </h3>
                <p className="text-[#6B7280] font-medium leading-relaxed max-w-sm">
                  Realiza cambios en el editor y compila tu documento para ver
                  la previsualización PDF en tiempo real.
                </p>
              </div>
              <Button
                onClick={onCompile}
                disabled={isCompiling}
                className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all bg-primary"
              >
                {isCompiling ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                Compilar Ahora
              </Button>
            </div>

            <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
          </div>
        )}
      </div>

      {/* Floating Fullscreen button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-8 right-8 h-12 w-12 rounded-full shadow-2xl z-30"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(210, 4, 45, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(210, 4, 45, 0.4);
        }
        .react-pdf__Page__canvas {
          margin: 0 auto;
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
}
