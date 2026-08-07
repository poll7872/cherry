"use client";

import { Send, Loader2, Cherry } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useState, useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useConversationQuery } from "@/hooks/use-workspace-queries";
import { createConversation } from "@/actions/conversations";
import { useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const {
    activeConvId,
    messages,
    isSending,
    sendMessage,
    setMessages,
    setActiveConvId,
  } = useWorkspaceStore();
  const [messageInput, setMessageInput] = useState("");
  const queryClient = useQueryClient();

  // TanStack Query
  const { data: conversation } = useConversationQuery(activeConvId);

  // Ref para leer isSending sin reactivar el effect (evita sobrescribir con datos obsoletos)
  const isSendingRef = useRef(isSending);
  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  // Sincronizar mensajes solo cuando la query devuelve datos nuevos (no al toggle de isSending)
  useEffect(() => {
    if (!conversation || isSendingRef.current) return;
    setMessages(conversation.messages || []);
  }, [conversation, setMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || isSending) return;
    const contentToSend = messageInput.trim();

    // Si no hay conversación activa, crear una automáticamente
    if (!activeConvId) {
      const title =
        contentToSend.slice(0, 40) + (contentToSend.length > 40 ? "…" : "");
      const result = await createConversation(projectId, title);

      if (result.errors.length > 0 || !result.data) {
        sileo.error({
          title: "Error",
          description: result.errors[0] || "No se pudo crear la conversación",
        });
        return;
      }

      setActiveConvId(result.data.id);
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });
    }

    setMessageInput("");
    await sendMessage(contentToSend);

    // Refrescar la caché de la conversación con el mensaje persistido del asistente.
    // Se lee del store porque en una conversación recién creada la closure aún tiene null.
    const currentConvId = useWorkspaceStore.getState().activeConvId;
    if (currentConvId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation", currentConvId],
      });
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col transition-colors duration-700 bg-black/5 dark:bg-white/5">
      {/* Chat Container */}
      <div className="flex-1 min-w-0 overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-10">
            <Cherry className="h-10 w-10 text-primary" />
            <p className="text-xl font-black tracking-[0.4em] italic uppercase text-foreground">
              ¿Cómo puedo ayudarte hoy?
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className="flex gap-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000"
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border border-border shadow-2xl transition-all duration-700 ${
                  msg.role === "assistant"
                    ? "bg-primary text-white scale-110"
                    : "bg-black/5 dark:bg-white/5 text-muted-foreground/30"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Cherry className="h-4 w-4" />
                ) : (
                  <p className="font-black text-[9px]">S1</p>
                )}
              </div>
              <div className="space-y-4 flex-1 min-w-0">
                <div
                  className={`text-[8px] font-black uppercase tracking-[0.4em] ${
                    msg.role === "assistant"
                      ? "text-primary"
                      : "text-muted-foreground/20"
                  }`}
                >
                  {msg.role === "assistant" ? "Cherry" : "Tú"}
                </div>
                <div className="py-2 transition-all duration-700">
                  {msg.role === "assistant" && msg.content === "" ? (
                    <div className="flex items-center gap-3 py-2 text-primary/40 animate-pulse">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                        Cherry está pensando...
                      </span>
                    </div>
                  ) : (
                    <MarkdownRenderer
                      content={msg.content}
                      className="text-base leading-relaxed font-medium tracking-tight text-foreground/90 dark:prose-invert prose-p:text-foreground/80 prose-strong:text-foreground prose-strong:font-black"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
      </div>

      {/* Message Input (Focused Bar) */}
      <div className="p-10 pb-16">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSendMessage}
            className="glass-panel border-border p-3 rounded-4xl shadow-2xl backdrop-blur-3xl flex items-end gap-3 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-700"
          >
            <textarea
              placeholder="Empieza tu paper de investigación..."
              rows={1}
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-base font-medium px-4 py-3 max-h-40 outline-none text-foreground placeholder:text-muted-foreground/20 leading-relaxed"
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
              disabled={isSending || !messageInput.trim()}
              className="h-10 w-10 rounded-2xl shadow-xl hover:shadow-primary/30 active:scale-90 transition-all bg-primary text-white border-none"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
