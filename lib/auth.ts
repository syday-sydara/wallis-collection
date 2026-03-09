// lib/auth.ts (Refactored POST handler)
import { cookies } from "next/headers";
import { handleSuccess, handleError, ApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    // ... validation and verification logic ...

    const token = createToken({ id: user.id, role: user.role });

    // Use the native Next.js cookies API
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return handleSuccess({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return handleError(error);
  }
}