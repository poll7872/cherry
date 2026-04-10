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
          styles: { description: "text-black" }
        });
      } else {
        sileo.success({ 
          title: "Eliminado", 
          description: `El documento ${docTitle} ha sido eliminado`,
          styles: { description: "text-black" }
        });
        onOpenChange(false);
        onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black text-[#111827]">¿Eliminar documento?</DialogTitle>
          <DialogDescription className="text-secondary font-medium pt-1">
            Estás a punto de eliminar <span className="font-bold text-[#111827]">{docTitle}</span>. Esta acción no se puede deshacer y perderás todo el contenido LaTeX de este archivo.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-between gap-3 pt-6">
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
            onClick={handleDelete}
            className="rounded-xl font-black px-8 shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95 bg-red-500 hover:bg-red-600 text-white border-none"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Eliminar Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
