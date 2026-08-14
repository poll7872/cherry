"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";
import {
  ChangePasswordSchema,
  ErrorResponseSchema,
  UpdateProfileSchema,
} from "@/lib/schemas";
import type { ActionState, FormState } from "@/lib/types";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_SESSION_NAME)?.value || null;
}

export async function updateProfile(
  prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) {
    return {
      errors: ["No autorizado. Por favor, inicia sesión de nuevo."],
      success: "",
    };
  }

  const validatedFields = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues.map((issue) => issue.message),
      success: "",
    };
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: validatedFields.data.name }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success
        ? Array.isArray(errorParsed.data.message)
          ? errorParsed.data.message[0]
          : errorParsed.data.message
        : "Error al actualizar el perfil";

      return { errors: [errorMessage], success: "" };
    }

    revalidatePath("/dashboard/perfil");
    return { errors: [], success: "Perfil actualizado correctamente" };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}

export async function changePassword(
  prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) {
    return {
      errors: ["No autorizado. Por favor, inicia sesión de nuevo."],
      success: "",
    };
  }

  const validatedFields = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues.map((issue) => issue.message),
      success: "",
    };
  }

  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: validatedFields.data.currentPassword,
        newPassword: validatedFields.data.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success
        ? Array.isArray(errorParsed.data.message)
          ? errorParsed.data.message[0]
          : errorParsed.data.message
        : "Error al cambiar la contraseña";

      return { errors: [errorMessage], success: "" };
    }

    return { errors: [], success: "Contraseña actualizada correctamente" };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}
