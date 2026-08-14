"use client";

import { useActionState, useEffect } from "react";
import { sileo } from "sileo";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { KeyRound, Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState(changePassword, undefined);

  useEffect(() => {
    if (!state) return;

    if (state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error",
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
        title: "Contraseña actualizada",
        description: state.success,
        styles: {
          description: "text-foreground font-sans text-sm",
          title: "font-sans font-bold text-lg text-primary",
        },
      });
    }
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <FieldGroup className="space-y-6">
        <Field>
          <FieldLabel
            htmlFor="currentPassword"
            className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
          >
            <span className="w-1 h-1 bg-primary rounded-full" />
            Contraseña actual
          </FieldLabel>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            required
            disabled={isPending}
            className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50 px-6 mt-2"
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="password"
            className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
          >
            <span className="w-1 h-1 bg-primary rounded-full" />
            Nueva contraseña
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            disabled={isPending}
            className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50 px-6 mt-2"
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2"
          >
            <span className="w-1 h-1 bg-primary rounded-full" />
            Confirmar nueva contraseña
          </FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            disabled={isPending}
            className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50 px-6 mt-2"
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all bg-primary text-white text-xs uppercase tracking-widest"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Cambiar contraseña
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
