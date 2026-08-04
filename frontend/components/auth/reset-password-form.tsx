"use client";

import { useActionState, useEffect } from "react"
import { sileo } from "sileo"
import { resetPassword } from "@/actions/auth"
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string | null
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter()
  const [state, action, pending] = useActionState(resetPassword, undefined)

  useEffect(() => {
    if (!state) return

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) =>
        sileo.error({
          title: "Error",
          description: error,
          styles: { description: "text-foreground font-sans text-sm" },
        }),
      )
    }

    if (state.success) {
      sileo.success({
        title: "Contraseña restablecida",
        description: state.success + ". Redirigiendo al login...",
        styles: { description: "text-foreground font-sans text-sm" },
      })
      
      const timer = setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <input type="hidden" name="token" value={token || ""} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirmar contraseña
                </FieldLabel>
                <Input id="confirm-password" name="confirmPassword" type="password" required />
                <FieldDescription>
                   Debe tener al menos 8 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Cambiando contraseña..." : "Cambiar contraseña"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}