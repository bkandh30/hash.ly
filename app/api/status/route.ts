import { db } from "@/lib/db";
import { links, clicks } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { redis } from "@/lib/rate-limit";

export async function GET() {
    const status: any = {
        timestamp: new Date().toISOString(),
        services: {},
        stats: {},
    };

    try {
        const linkCount = await db.select({
            count: sql<number>`COUNT(*)`
        }).from(links);

        const clickCount = await db.select({
            count: sql<number>`COUNT(*)`
        }).from(clicks);

        status.services.database = 'operational';
        status.stats.totalLinks = linkCount[0]?.count || 0;
        status.stats.totalClicks = clickCount[0]?.count || 0;
    } catch (error) {
        console.error("Error fetching links:", error);
        status.services.database = 'error';
    }

    try {
        await redis.ping();
        status.services.redis = 'operational';
    } catch (error) {
        console.error("Error pinging Redis:", error);
        status.services.redis = 'error';
    }
    
    const allOperational = Object.values(status.services).every(
        s => s === 'operational'
    );

    status.status = allOperational ? 'operational' : 'degraded';

    return NextResponse.json(status);
}

export const runtime = 'edge';