import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export const getPrisma = () => {
  if (prisma == null) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export default prisma;
