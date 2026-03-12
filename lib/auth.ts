// lib/auth.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/constants";
import { handleSuccess, handleError, ApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.password ?? "");

    if (!isValid) {
      throw new ApiError("Invalid credentials", 401);
    }

    const token = createToken({ id: user.id, role: user.role });

    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return handleSuccess({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}