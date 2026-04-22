// app/api/_internal/security-log/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  await prisma.securityEvent.create({
    data: {
      userId: body.userId,
      type: body.type,
      message: body.message,
      ip: body.ip,
      userAgent: body.userAgent,
      timestamp: new Date(body.timestamp),
    },
  });

  return NextResponse.json({ success: true });
}