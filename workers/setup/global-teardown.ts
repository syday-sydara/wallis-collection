import { prisma } from "../src/prisma/client";

module.exports = async () => {
  await prisma.$disconnect();
};
