"use server";

import {
  ErrorResponseSchema,
  ForgotPasswordSchema,
  LoginResponseSchema,
  LoginSchema,
  ResetPasswordSchema,
  SignupSchema,
  SuccessResponseSchema,
} from "@/lib/schemas";
import type { ActionState, FormState } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL, COOKIE_SESSION_NAME, SESSION_EXPIRATION_DAYS } from "@/lib/constants";

export async function verifyEmail(
  _prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token")?.toString();
  if (!token) {
    return {
      errors: ["Token de verificación es requerido"],
      success: "",
    };
  }

  try {
    const req = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const json = await req.json();

    if (!req.ok) {
      const { message } = ErrorResponseSchema.parse(json);
      return {
        errors: Array.isArray(message) ? message : [message],
        success: "",
      };
    }

    const { message } = SuccessResponseSchema.parse(json);
    return {
      errors: [],
      success: message,
    };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}

export async function signup(
  _prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
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
    const req = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        password: validatedFields.data.password,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const parsedError = ErrorResponseSchema.parse(json);
      return {
        errors: Array.isArray(parsedError.message) ? parsedError.message : [parsedError.message],
        success: "",
      };
    }

    return {
      errors: [],
      success:
        "Usuario registrado. Por favor, revisa tu correo para verificar tu cuenta.",
    };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues.map((issue) => issue.message),
      success: "",
    };
  }

  try {
    const req = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validatedFields.data.email,
        password: validatedFields.data.password,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const parsedError = ErrorResponseSchema.parse(json);
      return {
        errors: Array.isArray(parsedError.message)
          ? parsedError.message
          : [parsedError.message],
        success: "",
      };
    }

    const { access_token } = LoginResponseSchema.parse(json);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_SESSION_NAME, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * SESSION_EXPIRATION_DAYS,
      path: "/",
    });
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }

  redirect("/dashboard");
}

export async function forgotPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.issues.map((issue) => issue.message),
      success: "",
    };
  }

  try {
    const req = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validatedFields.data.email,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const parsedError = ErrorResponseSchema.parse(json);
      return {
        errors: Array.isArray(parsedError.message)
          ? parsedError.message
          : [parsedError.message],
        success: "",
      };
    }

    const { message } = SuccessResponseSchema.parse(json);
    return {
      errors: [],
      success: message,
    };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}

export async function resetPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token")?.toString();

  if (!token) {
    return {
      errors: ["Token de restablecimiento inválido"],
      success: "",
    };
  }

  const validatedFields = ResetPasswordSchema.safeParse({
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
    const req = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        newPassword: validatedFields.data.password,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const parsedError = ErrorResponseSchema.parse(json);
      return {
        errors: Array.isArray(parsedError.message)
          ? parsedError.message
          : [parsedError.message],
        success: "",
      };
    }

    const { message } = SuccessResponseSchema.parse(json);
    return {
      errors: [],
      success: message,
    };
  } catch {
    return {
      errors: ["Error de conexión. Intenta de nuevo más tarde."],
      success: "",
    };
  }
}
