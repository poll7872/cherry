"use client"

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { signup } from "@/actions/auth"
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
          title: "Algo salió mal!",
          description: error,
          styles: { description: "text-black" },
        }),
      );
    }

    if (state.success) {
      sileo.success({
        title: "Guardado",
        description: state.success,
        styles: { description: "text-black" },
      });
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crear cuenta</CardTitle>
          <CardDescription>
            Ingresa tu correo para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                />
              </Field>
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
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar contraseña
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </Field>
                </Field>
                <p className="text-sm text-muted-foreground">
                  Debe tener al menos 8 caracteres.
                </p>
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/auth/login">Inicia sesión</Link>
                </p>
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