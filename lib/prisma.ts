import { PrismaClient } from "@prisma/client";

declare global {
  // Allow Prisma reuse in development to avoid exhausting DB connections.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent Prisma from spawning massive Rust engines during Next.js static collection worker evaluation
export const prisma =
  global.prisma ??
  (process.env.NEXT_BUILD_PHASE === "true"
    ? (new Proxy({}, { get: () => () => Promise.resolve() }) as unknown as PrismaClient)
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
      }));

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

