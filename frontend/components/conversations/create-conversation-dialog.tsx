"use client";

import { useTransition } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createConversation } from "@/actions/conversations";
import { Loader2, MessageSquareText } from "lucide-react";
import { sileo } from "sileo";

interface CreateConversationDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newConvId: string) => void;
}

export function CreateConversationDialog({ 
  projectId, 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateConversationDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    if (!title || title.trim().length < 3) {
      sileo.error({ 
        title: "Error", 
        description: "El título debe tener al menos 3 caracteres",
        styles: { description: "text-foreground font-sans text-sm" }
      });
      return;
    }

    startTransition(async () => {
      const result = await createConversation(projectId, title.trim());
      
      if (result.errors.length > 0) {
        sileo.error({ 
          title: "Error al crear", 
          description: result.errors[0],
          styles: { description: "text-foreground font-sans text-sm" }
        });
      } else if (result.data) {
        sileo.success({ 
          title: "Éxito", 
          description: "Conversación creada correctamente",
          styles: { description: "text-foreground font-sans text-sm" }
        });
        onOpenChange(false);
        onSuccess(result.data.id);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]! glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-10 pb-4 text-center space-y-8">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner border border-white/5">
            <MessageSquareText className="h-7 w-7" />
          </div>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight italic">
              Nueva <span className="text-primary not-italic">conversación</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60 font-sans leading-relaxed text-sm">
              Inicia un nuevo chat con la IA Cherry para guiar tu proceso de escritura.
            </DialogDescription>
          </DialogHeader>
          
          <form id="create-conv-form" onSubmit={handleSubmit} className="pt-4 text-left">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  Título del Chat
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="ej: Revisión de introducción"
                  className="h-14 bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:opacity-30 px-6 mt-2"
                  disabled={isPending}
                  autoFocus
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4 p-10 bg-white/2 border-t border-white/5">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl flex-1 font-bold h-12 hover:bg-white/5 text-muted-foreground hover:text-white transition-all text-xs uppercase tracking-widest"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            form="create-conv-form"
            className="rounded-xl flex-1 h-12 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all bg-primary text-white text-xs uppercase tracking-widest border-none"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
