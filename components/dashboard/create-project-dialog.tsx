"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Plus, Loader2 } from "lucide-react";
import { createProject } from "@/actions/projects";
import { sileo } from "sileo";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(createProject, undefined);

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
      
      // Evitar renderizado en cascada posponiendo el cierre al siguiente frame
      requestAnimationFrame(() => {
        setOpen(false);
      });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-2xl px-6 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
          <Plus className="h-5 w-5" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl backdrop-blur-lg bg-background/95 border-none shadow-2xl p-0 overflow-hidden">
        <form action={action}>
          <div className="p-8 pb-0">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-3xl font-black tracking-tight">Crear Proyecto</DialogTitle>
              <DialogDescription className="text-secondary font-medium leading-relaxed">
                Comienza un nuevo documento LaTeX. Se creará una plantilla IEEE por defecto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-8">
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel htmlFor="name" className="text-xs font-black text-foreground uppercase tracking-widest pl-1">
                    Nombre del proyecto
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Mi Investigación Científica"
                    required
                    disabled={isPending}
                    className="rounded-2xl border-muted bg-muted/30 focus:bg-white focus:ring-primary/20 h-14 px-5 font-medium transition-all"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description" className="text-xs font-black text-foreground uppercase tracking-widest pl-1">
                    Descripción (opcional)
                  </FieldLabel>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Breve descripción de tu trabajo..."
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
              onClick={() => setOpen(false)} 
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
                  Creando...
                </>
              ) : (
                "Crear Proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
