"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";
import { Conversation } from "@/lib/schemas";

export async function getConversations(
  projectId: string,
): Promise<Conversation[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) return [];

  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/conversations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Get conversations error:", err);
    return [];
  }
}

export async function getConversation(
  id: string,
): Promise<Conversation | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Get conversation error:", err);
    return null;
  }
}

export async function createConversation(
  projectId: string,
  title: string,
): Promise<{ errors: string[]; data?: Conversation }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado"] };
  }

  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/conversations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      },
    );

    if (!response.ok) {
      return { errors: ["Error al crear la conversación"] };
    }

    const data = await response.json();
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { errors: [], data };
  } catch (err) {
    console.error("Create conversation error:", err);
    return { errors: ["Error de conexión"] };
  }
}
