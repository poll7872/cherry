import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { API_URL, COOKIE_SESSION_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSION_NAME)?.value;
  
  if (!token) {
    return new Response("No autorizado", { status: 401 });
  }

  const { conversationId, content } = await req.json();

  if (!conversationId || !content) {
    return new Response("Faltan datos requeridos", { status: 400 });
  }

  try {
    const backendResponse = await fetch(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!backendResponse.ok) {
        return new Response(backendResponse.body, { status: backendResponse.status });
    }

    // Proxy the stream explicitly bypassing any server action limitations
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("API Chat Proxy Error:", error);
    return new Response("Error interno", { status: 500 });
  }
}
