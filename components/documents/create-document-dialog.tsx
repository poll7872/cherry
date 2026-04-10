"use client";

import { useEffect, useActionState } from "react";
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
import { Label } from "@/components/ui/label";
import { createDocument } from "@/actions/documents";
import { Loader2, FileCode } from "lucide-react";
import { sileo } from "sileo";

interface CreateDocumentDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialState = {
  errors: [] as string[],
  success: false
};

export function CreateDocumentDialog({ 
  projectId, 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateDocumentDialogProps) {
  // Bind projectId to the action
  const createDocumentWithId = createDocument.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(createDocumentWithId, initialState);

  useEffect(() => {
    if (state.success) {
      sileo.success({ 
        title: "Éxito", 
        description: "Documento creado correctamente",
        styles: { description: "text-black" }
      });
      onOpenChange(false);
      onSuccess();
      
      // Reset state is handled by the component re-mounting or the action itself
    } else if (state.errors.length > 0) {
      state.errors.forEach(err => {
        sileo.error({ 
          title: "Error al crear", 
          description: err,
          styles: { description: "text-black" }
        });
      });
    }
  }, [state, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-4">
            <FileCode className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black text-[#111827]">Nuevo Documento</DialogTitle>
          <DialogDescription className="text-secondary font-medium pt-1">
            Crea un nuevo archivo LaTeX para tu investigación.
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-secondary pl-1">
              Nombre del Archivo
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="ej: abstract.tex"
              className="h-12 rounded-xl border-muted focus:border-primary focus:ring-primary transition-all font-medium"
              disabled={isPending}
              autoFocus
              required
            />
          </div>

          <DialogFooter className="sm:justify-between gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold px-6"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="rounded-xl font-black px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear Archivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
