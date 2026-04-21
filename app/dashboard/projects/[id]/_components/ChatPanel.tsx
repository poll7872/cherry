"use client";

import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { useConversationQuery } from "@/hooks/use-workspace-queries";

export function ChatPanel() {
  const { activeConvId, messages, isSending, sendMessage, setMessages } = useWorkspaceStore();
  const [messageInput, setMessageInput] = useState("");

  // TanStack Query
  const { data: conversation } = useConversationQuery(activeConvId);

  // Sincronizar mensajes cuando cambie la conversación activa
  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
    }
  }, [conversation?.id, setMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || isSending) return;
    const contentToSend = messageInput.trim();
    setMessageInput("");
    await sendMessage(contentToSend);
  };

  return (
    <div className="flex-1 flex flex-col transition-colors duration-700 bg-white/3">
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-10">
            <Sparkles className="h-10 w-10 text-primary" />
            <p className="text-xl font-black tracking-[0.4em] italic uppercase text-white">¿Cómo puedo ayudarte hoy?</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className="flex gap-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-2xl transition-all duration-700 ${
                msg.role === "assistant" ? "bg-primary text-white scale-110" : "bg-white/5 text-muted-foreground/30"
              }`}>
                {msg.role === "assistant" ? <Sparkles className="h-4 w-4" /> : <p className="font-black text-[9px]">S1</p>}
              </div>
              <div className="space-y-4 flex-1 min-w-0">
                <div className={`text-[8px] font-black uppercase tracking-[0.4em] ${
                  msg.role === "assistant" ? "text-primary" : "text-muted-foreground/20"
                }`}>
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
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Cherry está pensando...</span>
                    </div>
                  ) : (
                    <MarkdownRenderer 
                      content={msg.content}
                      className="text-base leading-relaxed font-medium tracking-tight text-white/90 prose-invert prose-p:text-white/80 prose-strong:text-white prose-strong:font-black"
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
            className="glass-panel border-white/10 p-3 rounded-4xl shadow-2xl backdrop-blur-3xl flex items-end gap-3 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-700"
          >
            <textarea 
              placeholder="Empieza tu paper de investigación..."
              rows={1}
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-base font-medium px-4 py-3 max-h-40 outline-none text-white placeholder:text-muted-foreground/20 leading-relaxed"
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
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
