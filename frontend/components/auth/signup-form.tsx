"use client";

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { signup } from "@/actions/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Logo } from "@/components/logo"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(signup, undefined)

  useEffect(() => {
    if (!state) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error de registro",
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
        title: "Cuenta creada",
        description: state.success,
        styles: { 
          description: "text-foreground font-sans text-sm",
          title: "font-sans font-bold text-lg text-primary"
        },
      });
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-8 w-full", className)} {...props}>
      <div className="flex flex-col items-start gap-4">
        <Logo className="h-20 w-20" />
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Únete a <span className="text-primary italic">Cherry</span>
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-[340px] leading-relaxed">
            Comienza a potenciar tu producción científica con herramientas de precisión.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 md:p-10 relative overflow-hidden group rounded-[2.5rem]">
        <form action={action}>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="name" className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                Nombre completo
              </FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Dr. Isaac Newton"
                required
                className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
              />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="email" className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="newton@universidad.edu"
                required
                className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="password" className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  Contraseña
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password" className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  Confirmar
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
                />
              </Field>
            </div>
            
            <Field className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-sm font-bold tracking-tight transition-all rounded-2xl bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]" 
                disabled={pending}
              >
                {pending ? "Preparando entorno..." : "Crear mi cuenta"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="h-px w-12 bg-border" />
        <p className="text-sm text-muted-foreground font-sans">
          ¿Ya eres usuario?{" "}
          <Link href="/auth/login" className="text-foreground font-bold hover:text-primary transition-all underline decoration-primary/40 underline-offset-4">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}