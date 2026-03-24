import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { ApiError, handleError, handleSuccess } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict("Email already exists");

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return handleSuccess({ id: user.id, email: user.email });
  } catch (error) {
    return handleError(error);
  }
}
