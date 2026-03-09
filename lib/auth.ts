// lib/auth.ts
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { ApiError, handleError, handleSuccess } from "@/lib/errors";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "session_token";

/* -------------------------------------------------- */
/*  Helper: Create JWT                                */
/* -------------------------------------------------- */
function createToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/* -------------------------------------------------- */
/*  Helper: Verify JWT                                */
/* -------------------------------------------------- */
function decodeToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/*  POST /api/auth  → Login                           */
/* -------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = createToken({ id: user.id, role: user.role });

    const res = handleSuccess({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    // Set secure cookie
    res.headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
        60 * 60 * 24 * 7
      }`
    );

    return res;
  } catch (error) {
    return handleError(error);
  }
}

/* -------------------------------------------------- */
/*  GET /api/auth  → Get current user                 */
/* -------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return handleSuccess({ user: null });
    }

    const decoded: any = decodeToken(token);
    if (!decoded) {
      return handleSuccess({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true },
    });

    return handleSuccess({ user });
  } catch (error) {
    return handleError(error);
  }
}
