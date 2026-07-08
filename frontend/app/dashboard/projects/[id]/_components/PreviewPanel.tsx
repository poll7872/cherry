"use client";

import dynamic from "next/dynamic";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";

const PDFViewer = dynamic(() => import("@/components/documents/pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black/5 dark:bg-zinc-900 animate-pulse" />
});

interface PreviewPanelProps {
  projectId: string;
}

export function PreviewPanel({ projectId }: PreviewPanelProps) {
  const { pdfFile, isCompiling, compileWorkspace } = useWorkspaceStore();

  const handleCompile = async () => {
    await compileWorkspace(projectId);
  };

  return (
    <div className="w-[45%] h-full border-l border-border bg-background">
      <PDFViewer 
        file={pdfFile} 
        isCompiling={isCompiling} 
        onCompile={handleCompile}
      />
    </div>
  );
}
