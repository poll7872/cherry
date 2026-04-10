"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2, Pencil } from "lucide-react";
import { updateProject } from "@/actions/projects";
import { sileo } from "sileo";
import { Project } from "@/lib/types";

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const updateProjectWithId = updateProject.bind(null, project.id);
  const [state, action, isPending] = useActionState(updateProjectWithId, undefined);

  useEffect(() => {
    if (!state) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) => sileo.error({
        title: "Error",
        description: error,
        styles: { description: "text-black" }
      }));
    }

    if (state.success) {
      sileo.success({
        title: "Éxito",
        description: state.success,
        styles: { description: "text-black" }
      });
      
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl backdrop-blur-lg bg-background/95 border-none shadow-2xl p-0 overflow-hidden">
        <form action={action}>
          <div className="p-8 pb-0">
            <DialogHeader className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                <Pencil className="h-6 w-6" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-center">Editar Proyecto</DialogTitle>
              <DialogDescription className="text-secondary font-medium leading-relaxed text-center">
                Actualiza los detalles de tu documento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-8">
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel htmlFor="edit-name" className="text-xs font-black text-foreground uppercase tracking-widest pl-1">
                    Nombre del proyecto
                  </FieldLabel>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={project.name}
                    placeholder="Nuevo nombre"
                    required
                    disabled={isPending}
                    className="rounded-2xl border-muted bg-muted/30 focus:bg-white focus:ring-primary/20 h-14 px-5 font-medium transition-all"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-description" className="text-xs font-black text-foreground uppercase tracking-widest pl-1">
                    Descripción (opcional)
                  </FieldLabel>
                  <Input
                    id="edit-description"
                    name="description"
                    defaultValue={project.description || ""}
                    placeholder="Nueva descripción"
                    disabled={isPending}
                    className="rounded-2xl border-muted bg-muted/30 focus:bg-white focus:ring-primary/20 h-14 px-5 font-medium transition-all"
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>
          <DialogFooter className="flex gap-4 p-8 bg-muted/30 mt-4">
            <Button 
              type="button"
              variant="ghost" 
              disabled={isPending}
              onClick={() => onOpenChange(false)} 
              className="rounded-2xl flex-1 font-bold h-12 hover:bg-white transition-colors"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-2xl flex-2 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
