"use client";

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { login } from "@/actions/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"

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
          title: "Error al iniciar sesión",
          description: error,
          styles: { description: "text-black" },
        }),
      );
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido</CardTitle>
          <CardDescription>Ingresa con tu correo electrónico</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/auth/signup" className="underline underline-offset-4">
                    Regístrate
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="px-6 text-center text-sm text-muted-foreground">
        Al continuar, aceptas nuestros <a href="#">Términos de Servicio</a> y{" "}
        <a href="#">Política de Privacidad</a>.
      </p>
    </div>
  )
}