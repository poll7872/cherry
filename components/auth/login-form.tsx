"use client";

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { login } from "@/actions/auth"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(login, undefined)

  useEffect(() => {
    if (!state) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error de acceso",
          description: error,
          styles: { 
            description: "text-foreground font-sans text-sm",
            title: "font-sans font-bold text-lg"
          },
        }),
      );
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-10 w-full", className)} {...props}>
      <div className="flex flex-col items-start gap-6">
        <Logo />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
            Bienvenido a <span className="text-primary italic">Cherry</span>
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-[340px] leading-relaxed">
            Ingresa a tu entorno de trabajo para continuar con tu producción científica.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 md:p-10 relative overflow-hidden group rounded-[2.5rem]">
        {/* Very Subtle Decorative Light */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <form action={action}>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="email" className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="investigador@ejemplo.com"
                required
                className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel htmlFor="password" className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  Contraseña
                </FieldLabel>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="h-14 bg-black/5 dark:bg-white/5 border-border focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl font-sans text-sm placeholder:text-muted-foreground/50"
              />
            </Field>
            <Field className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-sm font-bold tracking-tight transition-all rounded-2xl bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]" 
                disabled={pending}
              >
                {pending ? "Iniciando sesión..." : "Acceder al Workspace"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="h-px w-12 bg-border" />
        <p className="text-sm text-muted-foreground font-sans">
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/signup" className="text-foreground font-bold hover:text-primary transition-all underline decoration-primary/40 underline-offset-4">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}