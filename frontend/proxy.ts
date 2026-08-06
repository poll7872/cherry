import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESSION_NAME } from "@/lib/constants";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(COOKIE_SESSION_NAME)?.value);

  if (!hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
