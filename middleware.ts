import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/security-center")) {
    const user = await getSessionUser();
    if (!hasPermission(user, "VIEW_SECURITY_CENTER")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/security-center/:path*"]
};
