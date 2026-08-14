"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAccount } from "@/actions/settings";
import { sileo } from "sileo";

export function DangerZone() {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount();

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
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl h-12 px-8 font-black border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all text-xs uppercase tracking-widest"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar cuenta
        </Button>
      </DialogTrigger>
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
              Esta acción eliminará tu cuenta, tus proyectos, documentos y
              conversaciones de forma permanente.{" "}
              <span className="text-foreground font-bold opacity-100 block mt-2">
                Esta acción no se puede deshacer.
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4 p-10 bg-card/60 border-t border-border">
          <DialogClose
            type="button"
            disabled={isPending}
            className="rounded-xl flex-1 font-bold h-12 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all text-xs uppercase tracking-widest text-center"
          >
            Cancelar
          </DialogClose>
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
              "Eliminar mi cuenta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
