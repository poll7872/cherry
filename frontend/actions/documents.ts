"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";
import { ErrorResponseSchema, Document } from "@/lib/schemas";

export async function getDocuments(projectId: string): Promise<Document[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: [`documents-${projectId}`] },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Get documents error:", err);
    return [];
  }
}

export async function getDocument(docId: string): Promise<Document | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/documents/${docId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Get document error:", err);
    return null;
  }
}

export async function updateDocument(docId: string, title?: string, content?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado"], success: "" };
  }

  try {
    const response = await fetch(`${API_URL}/documents/${docId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const data = await response.json();
      const errorParsed = ErrorResponseSchema.safeParse(data);
      const errorMessage = errorParsed.success 
        ? (Array.isArray(errorParsed.data.message) ? errorParsed.data.message[0] : errorParsed.data.message)
        : "Error al actualizar el documento";
        
      return { errors: [errorMessage], success: "" };
    }

    const data = await response.json();
    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    } else {
      revalidatePath(`/dashboard/projects`);
    }
    
    return { errors: [], success: "Documento guardado correctamente" };
  } catch (err) {
    console.error("Update document error:", err);
    return { errors: ["Error de conexión"], success: "" };
  }
}

export async function createDocument(
  projectId: string, 
  prevState: { errors: string[]; success: boolean }, 
  formData: FormData
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;
  const title = formData.get("title") as string;

  if (!token) {
    return { errors: ["No autorizado"], success: false };
  }

  if (!title || title.trim().length < 3) {
    return { errors: ["El nombre debe tener al menos 3 caracteres"], success: false };
  }

  // Ensure .tex extension
  let finalTitle = title.trim();
  if (!finalTitle.endsWith(".tex") && !finalTitle.includes(".")) {
    finalTitle += ".tex";
  }

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: finalTitle, content: "" }),
    });

    if (!response.ok) {
      return { errors: ["Error al crear el documento"], success: false };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { errors: [], success: true };
  } catch (err) {
    console.error("Create document error:", err);
    return { errors: ["Error de conexión"], success: false };
  }
}

export async function deleteDocument(docId: string, projectId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado"], success: false };
  }

  try {
    const response = await fetch(`${API_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { errors: ["Error al eliminar el documento"], success: false };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { errors: [], success: true };
  } catch (err) {
    console.error("Delete document error:", err);
    return { errors: ["Error de conexión"], success: false };
  }
}
