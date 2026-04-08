"use client";

import { startTransition, useEffect } from "react";
import { useActionState } from "react";
import { verifyEmail } from "@/actions/auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyEmail, {
    errors: [],
    success: "",
  });

  useEffect(() => {
    if (!token) return;

    const formData = new FormData();
    formData.append("token", token);

    startTransition(() => {
      action(formData);
    });
  }, [token, action]);

  const isError = state.errors.length > 0;
  const isSuccess = !!state.success && !pending;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Verificar correo electrónico
          </CardTitle>

          <CardDescription>
            {pending
              ? "Estamos verificando tu correo..."
              : state.success}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p
            className={cn(
              "text-sm mb-4",
              isError ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {pending
              ? "Por favor espera un momento..."
              : isError
                ? state.errors[0]
                : "Tu correo fue verificado correctamente."}
          </p>
        </CardContent>

        {isSuccess && (
          <CardFooter className="flex justify-center">
            <Button asChild className="w-full">
              <Link href="/auth/login">Ir al inicio de sesión</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

