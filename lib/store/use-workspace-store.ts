import { create } from "zustand";
import { Message } from "@/lib/schemas";
import { updateDocument } from "@/actions/documents";
import { getConversation } from "@/actions/conversations";
import { compileProject } from "@/actions/compiler";
import { sileo } from "sileo";

interface WorkspaceState {
  // IDs Activos (Enlazados con TanStack Query)
  activeDocId: string | null;
  activeConvId: string | null;

  // Estado local/sucio (Editor y Chat en tiempo real)
  content: string;
  messages: Message[];

  // UI & Output
  isCompiling: boolean;
  isSending: boolean;
  pdfFile: { data: Uint8Array } | string | null;

  // Acciones
  setActiveDocId: (docId: string | null) => void;
  setActiveConvId: (convId: string | null) => void;
  setContent: (content: string) => void;
  setMessages: (messages: Message[]) => void;
  saveDocument: () => Promise<void>;
  compileWorkspace: (projectId: string) => Promise<string | null>;
  sendMessage: (content: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  activeDocId: null,
  activeConvId: null,
  content: "",
  messages: [],
  isCompiling: false,
  isSending: false,
  pdfFile: null,

  setActiveDocId: (docId) => set({ activeDocId: docId }),
  setActiveConvId: (convId) => set({ activeConvId: convId }),
  setContent: (content) => set({ content }),
  setMessages: (messages) => set({ messages }),

  saveDocument: async () => {
    const { activeDocId, content } = get();
    if (!activeDocId) return;
    const result = await updateDocument(activeDocId, undefined, content);
    if (result.errors.length > 0) {
      sileo.error({ title: "Error al guardar", description: result.errors[0] });
    } else {
      sileo.success({
        title: "Cambios guardados",
        description: "Sincronización completa",
      });
    }
  },

  compileWorkspace: async (projectId) => {
    set({ isCompiling: true });
    try {
      const { activeDocId, content } = get();

      if (activeDocId) {
        await updateDocument(activeDocId, undefined, content);
      }
      const result = await compileProject(projectId);
      if (result.errors.length > 0) {
        sileo.error({
          title: "Error de Compilación",
          description: result.errors[0],
        });
        return null;
      }

      if (result.pdfBase64) {
        const binaryString = window.atob(result.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        set({ pdfFile: { data: bytes } });
        sileo.success({
          title: "Compilación Correcta",
          description: "El visor PDF ha sido actualizado",
        });
      }

      return result.pdfBase64 || null;
    } finally {
      set({ isCompiling: false });
    }
  },

  sendMessage: async (userContent) => {
    const { activeConvId, isSending, messages } = get();
    if (!activeConvId || isSending) return;

    const assistantTempId = "assistant-" + Math.random().toString();

    set({
      isSending: true,
      messages: [
        ...messages,
        {
          id: "user-" + Math.random(),
          role: "user",
          content: userContent,
          conversationId: activeConvId,
          timestamp: new Date().toISOString(),
        },
        {
          id: assistantTempId,
          role: "assistant",
          content: "",
          conversationId: activeConvId,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          content: userContent,
        }),
      });

      if (!response.ok) throw new Error("Fallo en servidor IA");

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantTempId ? { ...m, content: m.content + chunk } : m,
          ),
        }));
      }

      const updatedConv = await getConversation(activeConvId);
      if (updatedConv) set({ messages: updatedConv.messages || [] });
    } catch {
      sileo.error({
        title: "Error",
        description: "Ocurrió un error al enviar el mensaje",
      });
    } finally {
      set({ isSending: false });
    }
  },
}));
