"use client";

import { useRef } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  LATEX_LANGUAGE_ID, 
  CHERRY_THEME_ID, 
  latexLanguageConfig, 
  latexTokensProvider, 
  cherryLightTheme 
} from "./latex-config";

// Optimización: Pre-cargar Monaco para mejor UX
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } });

interface LatexEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export function LatexEditor({ value, onChange, className }: LatexEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register LaTeX as a custom language
    monaco.languages.register({ id: LATEX_LANGUAGE_ID });

    // Register LaTeX language configuration and syntax highlighting
    monaco.languages.setLanguageConfiguration(LATEX_LANGUAGE_ID, latexLanguageConfig);
    monaco.languages.setMonarchTokensProvider(LATEX_LANGUAGE_ID, latexTokensProvider);

    // Register and set the custom Cherry theme
    monaco.editor.defineTheme(CHERRY_THEME_ID, cherryLightTheme);
    monaco.editor.setTheme(CHERRY_THEME_ID);
  };

  return (
    <div className={className}>
      <Editor
        height="100%"
        defaultLanguage={LATEX_LANGUAGE_ID}
        theme={CHERRY_THEME_ID}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontWeight: "500",
          wordWrap: "on",
          lineNumbers: "on",
          folding: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 40, bottom: 40 },
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          roundedSelection: true,
          contextmenu: true,
        }}
      />
    </div>
  );
}
