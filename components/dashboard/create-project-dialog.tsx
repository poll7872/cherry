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
import { Plus, Loader2, BookOpen } from "lucide-react";
import { createProject } from "@/actions/projects";
import { sileo } from "sileo";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(createProject, undefined);

  useEffect(() => {
    if (!state) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error",
          description: error,
          styles: { 
            description: "text-foreground font-sans text-sm",
            title: "font-sans font-bold text-lg"
          },
        }),
      );
    }

    if (state.success) {
      sileo.success({
        title: "Proyecto iniciado",
        description: "El nuevo entorno de investigación ha sido creado exitosamente.",
        styles: { 
          description: "text-foreground font-sans text-sm",
          title: "font-sans font-bold text-lg text-primary"
        },
      });

      requestAnimationFrame(() => {
        setOpen(false);
      });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl px-8 h-12 shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all font-black uppercase tracking-wider bg-primary text-white border-none">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]! glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
        <form action={action}>
          <div className="p-10 pb-4 text-center space-y-8">
            <div className="mx-auto w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner border border-white/5">
              <BookOpen className="h-7 w-7" />
            </div>
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight italic">
                Nuevo proyecto
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/60 font-sans leading-relaxed text-sm">
                Configuraremos un entorno LaTeX automatizado y optimizado para tu próxima producción científica.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-8 py-4">
              <FieldGroup className="space-y-6 text-left">
                <Field>
                  <FieldLabel
                    htmlFor="name"
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Título del proyecto
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    placeholder="ej. Análisis de Sistemas Complejos"
                    required
                    disabled={isPending}
                    className="h-14 bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:opacity-30 px-6 mt-2"
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="description"
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Descripción resumida
                  </FieldLabel>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Describe brevemente el alcance del paper..."
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
              onClick={() => setOpen(false)}
              className="rounded-xl flex-1 font-bold h-12 hover:bg-white/5 text-muted-foreground hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl flex-1 h-12 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all bg-primary text-white text-xs uppercase tracking-widest"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
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
