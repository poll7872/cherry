"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

const CODE_COPY_BUTTON = `<button type="button" data-copy-code aria-label="Copiar código" title="Copiar código" class="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 select-none transition-colors">${COPY_SVG}</button>`;

function withCodeCopyButtons(html: string): string {
  // `<pre>` blocks cannot be nested and marked escapes inner `<`, so the
  // match terminates at the real closing tag.
  return html.replace(/<pre>[\s\S]*?<\/pre>/g, (pre) => {
    return `<div class="relative group">${pre}${CODE_COPY_BUTTON}</div>`;
  });
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => {
    // Marked is much more robust than snarkdown
    // We use a simple configuration for the research workspace
    const raw = marked.parse(content, {
      breaks: true,
      gfm: true,
    });
    const parsed = typeof raw === "string" ? raw : "";

    // DOMPurify requires a browser `window`; it is a no-op during SSR.
    if (typeof window === "undefined") {
      return withCodeCopyButtons(parsed);
    }
    return DOMPurify.sanitize(withCodeCopyButtons(parsed));
  }, [content]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>("[data-copy-code]");
    if (!button) return;

    const code = button.parentElement?.querySelector("pre code")?.textContent ?? "";
    if (!code) return;

    navigator.clipboard
      .writeText(code)
      .then(() => {
        button.innerHTML = CHECK_SVG;
        button.classList.add("text-primary");
        setTimeout(() => {
          button.innerHTML = COPY_SVG;
          button.classList.remove("text-primary");
        }, 1500);
      })
      .catch(() => {});
  };

  return (
    <div
      className={`relative rounded-2xl border border-border bg-card/50 dark:bg-white/[0.06] p-5`}
      onClick={handleContainerClick}
    >
      <div
        className={`prose dark:prose-invert [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_img]:max-w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
