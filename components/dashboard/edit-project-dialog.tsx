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

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const updateProjectWithId = updateProject.bind(null, project.id);
  const [state, action, isPending] = useActionState(
    updateProjectWithId,
    undefined,
  );

  useEffect(() => {
    if (!state) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error de edición",
          description: error,
          styles: {
            description: "text-foreground font-sans text-sm",
            title: "font-sans font-bold text-lg",
          },
        }),
      );
    }

    if (state.success) {
      sileo.success({
        title: "Registro actualizado",
        description: "Los detalles del proyecto han sido guardados correctamente.",
        styles: {
          description: "text-foreground font-sans text-sm",
          title: "font-sans font-bold text-lg text-primary",
        },
      });

      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]! glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
        <form action={action}>
          <div className="p-10 pb-4 text-center space-y-8">
            <div className="mx-auto w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner border border-white/5">
              <Pencil className="h-7 w-7" />
            </div>
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-4xl font-black text-white tracking-tighter italic">
                Editar <span className="text-primary not-italic ml-2">proyecto</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/60 font-sans leading-relaxed text-sm">
                Actualiza los datos del proyecto. Estos cambios se sincronizarán en todo el espacio de trabajo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-8 py-4">
              <FieldGroup className="space-y-6 text-left">
                <Field>
                  <FieldLabel
                    htmlFor="edit-name"
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Título del Proyecto
                  </FieldLabel>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={project.name}
                    placeholder="ej. Teoría de Cuerdas Avanzada"
                    required
                    disabled={isPending}
                    className="h-14 bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:opacity-30 px-6 mt-2"
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="edit-description"
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Descripción Detallada
                  </FieldLabel>
                  <Input
                    id="edit-description"
                    name="description"
                    defaultValue={project.description || ""}
                    placeholder="Actualiza la descripción técnica..."
                    disabled={isPending}
                    className="h-14 bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:opacity-30 px-6 mt-2"
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4 p-10 bg-white/2 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="rounded-xl flex-1 font-bold h-12 hover:bg-white/5 text-muted-foreground hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl flex-1 h-12 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all bg-primary text-white text-xs uppercase tracking-widest"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
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
