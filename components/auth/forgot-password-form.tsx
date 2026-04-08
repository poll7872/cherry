"use client";

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { forgotPassword } from "@/actions/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(forgotPassword, undefined)

  useEffect(() => {
    if (!state) return

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error",
          description: error,
          styles: { description: "text-black" },
        }),
      )
    }

    if (state.success) {
      sileo.success({
        title: "Correo enviado",
        description: state.success,
        styles: { description: "text-black" },
      })
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restaurar tu contraseña.
          </CardDescription>
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
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}