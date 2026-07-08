"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";
import { CreateProjectSchema, ErrorResponseSchema } from "@/lib/schemas";
import { Project, FormState } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: ["projects"] }, // Para revalidación selectiva
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function createProject(prevState: FormState, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado. Por favor, inicia sesión de nuevo."], success: "" };
  }

  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors.name || ["Datos inválidos"],
      success: "",
    };
  }

  const { name, description } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success 
        ? (Array.isArray(errorParsed.data.message) ? errorParsed.data.message[0] : errorParsed.data.message)
        : "Error al crear el proyecto";
        
      return { errors: [errorMessage], success: "" };
    }

    revalidatePath("/dashboard");
    return { errors: [], success: "Proyecto creado correctamente" };
  } catch (err) {
    console.error("Create project error:", err);
    return { errors: ["Error de conexión. Intenta de nuevo más tarde."], success: "" };
  }
}

export async function updateProject(projectId: string, prevState: FormState, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado. Por favor, inicia sesión de nuevo."], success: "" };
  }

  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors.name || ["Datos inválidos"],
      success: "",
    };
  }

  const { name, description } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success 
        ? (Array.isArray(errorParsed.data.message) ? errorParsed.data.message[0] : errorParsed.data.message)
        : "Error al actualizar el proyecto";
        
      return { errors: [errorMessage], success: "" };
    }

    revalidatePath("/dashboard");
    return { errors: [], success: "Proyecto actualizado correctamente" };
  } catch (err) {
    console.error("Update project error:", err);
    return { errors: ["Error de conexión. Intenta de nuevo más tarde."], success: "" };
  }
}

export async function deleteProject(projectId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado. Por favor, inicia sesión de nuevo."], success: "" };
  }

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success 
        ? (Array.isArray(errorParsed.data.message) ? errorParsed.data.message[0] : errorParsed.data.message)
        : "Error al eliminar el proyecto";
        
      return { errors: [errorMessage], success: "" };
    }

    revalidatePath("/dashboard");
    return { errors: [], success: "Proyecto eliminado correctamente" };
  } catch (err) {
    console.error("Delete project error:", err);
    return { errors: ["Error de conexión. Intenta de nuevo más tarde."], success: "" };
  }
}

export async function getProject(projectId: string): Promise<Project | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: [`project-${projectId}`] },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}
