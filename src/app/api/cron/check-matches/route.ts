import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { getTournaments, getMatches, Match } from "@/lib/padel"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
    return NextResponse.json({ message: "Cron job stubbed for build safety" });
}
