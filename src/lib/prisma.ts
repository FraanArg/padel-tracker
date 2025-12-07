import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is available
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create PrismaClient if DATABASE_URL is set
let prisma: PrismaClient | null = null;

if (isDatabaseAvailable) {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
    prisma = globalForPrisma.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export { prisma, isDatabaseAvailable };
