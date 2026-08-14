"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";
import { ErrorResponseSchema, ThemeSchema } from "@/lib/schemas";
import type { ActionState } from "@/lib/types";

export async function updateTheme(theme: string): Promise<ActionState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return {
      errors: ["No autorizado. Por favor, inicia sesión de nuevo."],
      success: "",
    };
  }

  const validated = ThemeSchema.safeParse(theme);
  if (!validated.success) {
    return { errors: ["Tema inválido"], success: "" };
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ theme: validated.data }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success
        ? Array.isArray(errorParsed.data.message)
          ? errorParsed.data.message[0]
          : errorParsed.data.message
        : "Error al guardar el tema";

      return { errors: [errorMessage], success: "" };
    }

    return { errors: [], success: "Tema guardado correctamente" };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}

export async function deleteAccount(): Promise<ActionState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return {
      errors: ["No autorizado. Por favor, inicia sesión de nuevo."],
      success: "",
    };
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success
        ? Array.isArray(errorParsed.data.message)
          ? errorParsed.data.message[0]
          : errorParsed.data.message
        : "Error al eliminar la cuenta";

      return { errors: [errorMessage], success: "" };
    }

    cookieStore.delete(COOKIE_SESSION_NAME);
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }

  redirect("/auth/login");
}
