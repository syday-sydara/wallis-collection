// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { logSecurityEvent } from "@/lib/security/events";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/security-center")) {
    const user = await getSessionUser();

    if (!hasPermission(user, "VIEW_SECURITY_CENTER")) {
      await logSecurityEvent({
        userId: user?.id,
        type: "PERMISSION_DENIED",
        message: `Denied access to ${url.pathname}`,
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent")
      });

      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/security-center/:path*"]
};
