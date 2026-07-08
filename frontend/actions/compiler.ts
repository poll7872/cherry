"use server";

import { cookies } from "next/headers";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";

export async function compileProject(projectId: string): Promise<{ errors: string[]; pdfBase64?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;

  if (!token) {
    return { errors: ["No autorizado"] };
  }

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Ensure we don't cache the PDF compilation result too aggressively
      cache: "no-store"
    });

    if (!response.ok) {
      return { errors: ["Error al compilar el proyecto. Verifica tu código LaTeX."] };
    }

    // Get the binary data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return { errors: [], pdfBase64: base64 };
  } catch (err) {
    console.error("Compile project error:", err);
    return { errors: ["Error de conexión con el motor de compilación"] };
  }
}
