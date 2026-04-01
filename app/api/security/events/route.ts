import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "50");

  const type = searchParams.get("type") || undefined;
  const severity = searchParams.get("severity") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;

  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : undefined;

  const where: any = {};

  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (userId) where.userId = userId;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.securityEvent.count({ where }),
  ]);

  return NextResponse.json({
    data: events,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}