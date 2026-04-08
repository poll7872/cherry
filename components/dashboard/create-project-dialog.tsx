"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl backdrop-blur-lg bg-background/95 border-border/60 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">Crear Proyecto</DialogTitle>
          <DialogDescription className="text-secondary leading-relaxed font-medium">
            Comienza un nuevo documento LaTeX. Se creará una plantilla IEEE por defecto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name" className="text-sm font-bold text-foreground/80 lowercase tracking-wide">
                Nombre del proyecto
              </FieldLabel>
              <Input
                id="name"
                placeholder="Mi Investigación Científica"
                className="rounded-xl border-border/60 focus:ring-primary/20 h-11"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description" className="text-sm font-bold text-foreground/80 lowercase tracking-wide">
                Descripción (opcional)
              </FieldLabel>
              <Input
                id="description"
                placeholder="Breve descripción de tu trabajo..."
                className="rounded-xl border-border/60 focus:ring-primary/20 h-11"
              />
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter className="flex gap-3 sm:justify-between pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl flex-1 border-border/60 hover:bg-muted/50 transition-colors">
            Cancelar
          </Button>
          <Button type="submit" onClick={() => setOpen(false)} className="rounded-xl flex-[1.5] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
