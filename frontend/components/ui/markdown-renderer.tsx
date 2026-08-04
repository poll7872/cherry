"use client";

import { marked } from "marked";
import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => {
    // Marked is much more robust than snarkdown
    // We use a simple configuration for the research workspace
    return marked.parse(content, {
      breaks: true,
      gfm: true,
    });
  }, [content]);

  return (
    <div 
      className={`prose-cherry [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_img]:max-w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
