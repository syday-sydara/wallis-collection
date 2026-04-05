// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { adminListProductsPaginated } from "@/lib/products/admin";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    await requirePermission(PERMISSIONS.VIEW_ADMIN);

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const data = await adminListProductsPaginated({ cursor });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Admin products error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}