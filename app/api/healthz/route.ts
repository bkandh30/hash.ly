import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        const result = await db.select({
            count: sql<number>`COUNT(*)`
        }).from(links);

        return NextResponse.json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString(),
            linksCount: result[0]?.count || 0,
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return NextResponse.json({
            status: "error",
            database: "disconnected",
            timestamp: new Date().toISOString(),
            error: "Database connection failed",
        }, 
        { status: 500 }
        );
    }
}

export const runtime = "edge";