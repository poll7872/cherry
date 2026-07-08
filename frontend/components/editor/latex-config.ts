import { languages, editor } from "monaco-editor";

export const LATEX_LANGUAGE_ID = "latex";
export const CHERRY_THEME_ID = "cherry-light";

export const latexLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: "%",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "$", close: "$" },
    { open: "$$", close: "$$" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "$", close: "$" },
  ],
};

export const latexTokensProvider: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".latex",

  keywords: [
    "documentclass", "usepackage", "begin", "end", "item",
    "newcommand", "renewcommand", "newenvironment", "renewenvironment",
    "include", "input", "bibliography", "bibliographystyle",
  ],

  sectionCommands: [
    "part", "chapter", "section", "subsection", "subsubsection",
    "paragraph", "subparagraph", "title", "author", "date",
    "maketitle", "tableofcontents", "listoffigures", "listoftables",
  ],

  mathCommands: [
    "frac", "sqrt", "sum", "int", "lim", "infty", "alpha", "beta",
    "gamma", "delta", "epsilon", "theta", "lambda", "mu", "pi",
    "sigma", "omega", "partial", "nabla", "times", "div", "pm",
    "leq", "geq", "neq", "approx", "equiv", "in", "subset",
    "left", "right", "cdot", "ldots", "mathbb", "mathcal",
    "mathrm", "mathbf", "mathit", "text",
  ],

  tokenizer: {
    root: [
      // Comments
      [/%.*$/, "comment"],

      // Math mode
      [/\$\$/, "keyword.math"],
      [/\$/, "keyword.math"],

      // Commands
      [/\\([a-zA-Z@]+)/, {
        cases: {
          "@keywords": "keyword.control",
          "@sectionCommands": "keyword.section",
          "@mathCommands": "keyword.math",
          "@default": "keyword"
        }
      }],

      // Symbols and Brackets
      [/[{}[\]()]/, "@brackets"],
      [/[&\\]/, "delimiter"],

      // Numbers
      [/\d+(\.\d+)?/, "number"],

      // Environment names
      [/(\\begin|\\end)(\{)([^}]+)(\})/, [
        "keyword.control", "delimiter.bracket", "variable.parameter", "delimiter.bracket"
      ]],
    ],
  },
};

export const cherryLightTheme: editor.IStandaloneThemeData = {
  base: "vs", // Light base
  inherit: true,
  rules: [
    { token: "comment", foreground: "9CA3AF", fontStyle: "italic" },
    { token: "keyword.control", foreground: "D2042D", fontStyle: "bold" },
    { token: "keyword.section", foreground: "111827", fontStyle: "bold" },
    { token: "keyword.math", foreground: "059669" }, // Green for math
    { token: "keyword", foreground: "D2042D" },
    { token: "variable.parameter", foreground: "7C3AED", fontStyle: "bold" }, // Purple for env names
    { token: "number", foreground: "777777" },
    { token: "delimiter.bracket", foreground: "777777" },
  ],
  colors: {
    "editor.background": "#FCFDFF",
    "editor.foreground": "#1F2937",
    "editorLineNumber.foreground": "#E5E7EB",
    "editorLineNumber.activeForeground": "#D2042D",
    "editor.lineHighlightBackground": "#F3F4F6",
    "editorCursor.foreground": "#D2042D",
    "editor.selectionBackground": "#D2042D20",
    "editorIndentGuide.background": "#F3F4F6",
  },
};
