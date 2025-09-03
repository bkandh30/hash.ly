import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { redis } from "@/lib/rate-limit";

export async function GET() {
    try {
        const linkCount = await db.select({
            count: sql<number>`COUNT(*)`
        }).from(links);

        let redisStatus = "disconnected";
        try {
            await redis.ping();
            redisStatus = "connected";
        } catch (error) {
            console.error("Redis ping failed:", error);
        }

        return NextResponse.json({
            status: "ok",
            database: "connected",
            redis: redisStatus,
            timestamp: new Date().toISOString(),
            linksCount: linkCount[0]?.count || 0,
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return NextResponse.json({
            status: "error",
            database: "disconnected",
            redis: 'disconnected',
            error: "Service connection failed",
        }, 
        { status: 500 }
        );
    }
}

export const runtime = "edge";