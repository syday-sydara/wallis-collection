// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { adminListProductsPaginated } from "@/lib/products/admin";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { unauthorized, forbidden, serverError } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/require-permission";

export function requireAdmin(req?: {
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  source?: string | null;
}) {
  return requirePermission("VIEW_ADMIN", req);
}


export async function GET(req: Request) {
  try {
    // Permission check
    await requirePermission(PERMISSIONS.VIEW_ADMIN);

    const { searchParams } = new URL(req.url);

    const rawCursor = searchParams.get("cursor");
    const cursor = rawCursor && rawCursor.trim() !== "" ? rawCursor : undefined;

    const data = await adminListProductsPaginated({ cursor });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Admin products error:", err);

    // Permission errors
    if (err?.code === "UNAUTHORIZED") {
      return unauthorized("Unauthorized", { code: "UNAUTHORIZED" });
    }

    if (err?.code === "FORBIDDEN") {
      return forbidden("Forbidden", { code: "FORBIDDEN" });
    }

    // Unexpected errors
    return serverError("Failed to load admin products", err, {
      code: "SERVER_ERROR",
    });
  }
}
