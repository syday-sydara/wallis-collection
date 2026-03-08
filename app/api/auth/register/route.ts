<<<<<<< HEAD
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
=======
export async function POST() { return Response.json({ ok: true }) }
>>>>>>> 53697748822e2979fd62a1f64ed72d91a6552a19
