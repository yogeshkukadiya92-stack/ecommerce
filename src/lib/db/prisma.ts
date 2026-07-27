import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Next.js can evaluate server modules in more than one route bundle. Keeping the
// client on globalThis prevents every bundle from creating its own connection
// pool and retaining the associated sockets and buffers for the process lifetime.
export const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());
