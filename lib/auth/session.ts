import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  risk_score: number;
};

function getSessionToken(): string | null {
  return cookies().get("wallis_session")?.value ?? null;
}

async function resolveToken(token: string | null) {
  if (!token) return null;
  return { userId: token }; // replace with JWT/NextAuth later
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = getSessionToken();
  const session = await resolveToken(token);
  if (!session?.userId) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      risk_score: true
    }
  });
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
