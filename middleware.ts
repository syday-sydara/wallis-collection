// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  if (pathname.startsWith("/security-center")) {
    const user = await getSessionUser();

    if (!hasPermission(user, "VIEW_SECURITY_CENTER")) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const userAgent = req.headers.get("user-agent");

      // Fire-and-forget logging
      fetch(`${url.origin}/api/security/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          type: "PERMISSION_DENIED",
          message: `Denied access to ${pathname}`,
          ip,
          userAgent
        }),
        keepalive: true
      });

      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/security-center/:path*"]
};