import { auth } from "@/auth"
// import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
    return NextResponse.json({ message: "Web push stubbed for build safety" });
}
