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
import { Loader2, Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
import { sileo } from "sileo";
import { Project } from "@/lib/types";

interface DeleteProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project.id);

      if (result.errors.length > 0) {
        result.errors.forEach((err) =>
          sileo.error({
            title: "Error de solicitud",
            description: err,
            styles: {
              description: "text-foreground font-sans text-sm",
              title: "font-sans font-bold text-lg",
            },
          }),
        );
      } else {
        sileo.success({
          title: "Eliminación exitosa",
          description: "El proyecto ha sido archivado correctamente.",
          styles: {
            description: "text-foreground font-sans text-sm",
            title: "font-sans font-bold text-lg text-primary",
          },
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]! glass-panel p-0 overflow-hidden border-border shadow-2xl">
        <div className="p-10 pb-4 text-center space-y-8">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mb-2 shadow-inner border border-destructive/5">
            <Trash2 className="h-7 w-7" />
          </div>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-black text-foreground tracking-tighter italic">
              Confirmar <span className="text-destructive not-italic ml-2">Eliminación</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60 font-sans leading-relaxed text-sm">
              ¿Estás seguro de eliminar este proyecto? <br/>
              <span className="text-foreground font-bold opacity-100 mt-2 block">&quot;{project.name}&quot;</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4 p-10 bg-card/60 border-t border-border">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="rounded-xl flex-1 font-bold h-12 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all text-xs uppercase tracking-widest text-center"
          >
            Abortar
          </button>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-xl flex-1 h-12 font-black shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all bg-destructive text-white text-xs uppercase tracking-widest"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Confirmar Borrado"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
