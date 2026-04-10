"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
import { sileo } from "sileo";
import { Project } from "@/lib/types";

interface DeleteProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      
      if (result.errors.length > 0) {
        result.errors.forEach(err => sileo.error({
          title: "Error",
          description: err,
          styles: { description: "text-black" }
        }));
      } else {
        sileo.success({
          title: "Eliminado",
          description: "El proyecto ha sido borrado correctamente.",
          styles: { description: "text-black" }
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl backdrop-blur-lg bg-white/95 border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-center">¿Confirmar eliminación?</DialogTitle>
            <DialogDescription className="text-secondary font-medium leading-relaxed text-center">
              Estás a punto de eliminar <span className="text-foreground font-bold">&quot;{project.name}&quot;</span>. Esta acción no se puede deshacer y perderás todos los documentos asociados.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="flex gap-3 p-6 bg-muted/30">
          <Button 
            variant="ghost" 
            disabled={isPending}
            onClick={() => onOpenChange(false)} 
            className="rounded-2xl flex-1 font-bold h-12 hover:bg-white transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-2xl flex-1 h-12 font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/40 active:scale-95 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Borrando...
              </>
            ) : (
              "Sí, Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
