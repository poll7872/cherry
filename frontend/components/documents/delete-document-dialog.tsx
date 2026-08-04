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
import { deleteDocument } from "@/actions/documents";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { sileo } from "sileo";

interface DeleteDocumentDialogProps {
  projectId: string;
  docId: string;
  docTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteDocumentDialog({ 
  projectId, 
  docId, 
  docTitle,
  open, 
  onOpenChange, 
  onSuccess 
}: DeleteDocumentDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDocument(docId, projectId);
      
      if (result.errors.length > 0) {
        sileo.error({ 
          title: "Error al eliminar", 
          description: result.errors[0],
          styles: { description: "text-foreground font-sans text-sm" }
        });
      } else {
        sileo.success({ 
          title: "Eliminado", 
          description: `El documento ${docTitle} ha sido eliminado`,
          styles: { description: "text-foreground font-sans text-sm" }
        });
        onOpenChange(false);
        onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem]! glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-10 pb-4 text-center space-y-8">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mb-2 shadow-inner border border-destructive/10">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight italic">
              ¿Eliminar <span className="text-destructive not-italic">archivo?</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60 font-sans leading-relaxed text-sm">
              Estás a punto de remover <span className="font-bold text-white/80">{docTitle}</span> de este workspace. Esta acción es irreversible y los datos se perderán permanentemente.
            </DialogDescription>
          </DialogHeader>
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
            onClick={handleDelete}
            className="rounded-xl flex-1 h-12 font-black shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all bg-destructive text-white text-xs uppercase tracking-widest border-none"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
