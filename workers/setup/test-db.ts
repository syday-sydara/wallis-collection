import { execSync } from "child_process";
import { prisma } from "../src/prisma/client";

export default async function setupTestDB() {
  // Reset DB using Prisma migrate
  execSync("pnpm prisma migrate reset --force --skip-generate", {
    stdio: "inherit",
  });

  await prisma.$connect();
}
