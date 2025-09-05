import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const batchStatsSchema = z.object({
    shortIds: z.array(z.string()).min(1).max(50),
});

export async function POST(request: NextRequest) {
    try {
        const rateLimitResponse = await withRateLimit(request, 'api');
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();
        const validation = batchStatsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: {
                        code: 'INVALID_REQUEST',
                        message: validation.error.issues[0]?.message || 'Invalid request',
                    },
                },
                { status: 400 }
            );
        }

        const { shortIds } = validation.data;

        const linksData = await db
            .select({
                shortId: links.shortId,
                longUrl: links.longUrl,
                clicks: links.clicks,
                createdAt: links.createdAt,
                lastAccess: links.lastAccess,
                expiresAt: links.expiresAt,
            })
            .from(links)
            .where(inArray(links.shortId, shortIds));

        const linksMap = new Map();
        const now = new Date();

        linksData.forEach(link => {
            const isExpired = link.expiresAt ? link.expiresAt < now : false;
            linksMap.set(link.shortId, {
                shortId: link.shortId,
                longUrl: link.longUrl,
                clicks: link.clicks,
                createdAt: link.createdAt.toISOString(),
                lastAccess: link.lastAccess?.toISOString() || null,
                expiresAt: link.expiresAt?.toISOString() || null,
                status: isExpired ? 'expired' : 'active',
            });
        });

        type LinkStats = {
            shortId: string;
            longUrl: string;
            clicks: number;
            createdAt: string;
            lastAccess: string | null;
            expiresAt: string | null;
            status: 'active' | 'expired';
        }

        type LinkError = {
            error: string;
            message: string;
        }

        const results: Record<string, LinkStats | LinkError> = {};

        shortIds.forEach(shortId => {
            if (linksMap.has(shortId)) {
                results[shortId] = linksMap.get(shortId) as LinkStats;
            } else {
                results[shortId] = {
                    error: 'NOT_FOUND',
                    message: 'Link not found',
                };
            }
        });

        return NextResponse.json({
            success: true,
            data: results,
            requested: shortIds.length,
            found: linksMap.size,
        });
    } catch (error) {
        console.error('Error fetching batch stats:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch batch statistics',
                },
            },
            { status: 500 }
        );
    }
}


export const runtime = 'edge';