// lib/prisma/index.ts
import { PrismaClient } from "@prisma/client";
import { phoneNormalizationMiddleware } from "./middleware/phone-normalization";

export const prisma = new PrismaClient();

prisma.$use(phoneNormalizationMiddleware());
