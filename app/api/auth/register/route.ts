import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashed = await hashPassword(password);

  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return NextResponse.json({ success: true });
}