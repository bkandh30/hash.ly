import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withRateLimit } from "@/lib/rate-limit";
import { validateShortId } from "@/lib/validate";

export async function GET(
    request: NextRequest,
    { params }: { params: { shortId: string } }
) {
    try {
        const rateLimitResponse = await withRateLimit(request, 'api');
        if (rateLimitResponse)
            return rateLimitResponse;

        const { shortId } = params;

        if (!validateShortId(shortId)) {
            return NextResponse.json(
                {
                    error: {
                        code: 'INVALID_SHORT_ID',
                        message: 'Invalid short ID',
                    },
                },
                { status: 400 }
            );
        }

        const link = await db
            .select()
            .from(links)
            .where(eq(links.shortId, shortId))
            .limit(1);

        if (link.length === 0) {
            return NextResponse.json(
                {
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Link not found',
                    },
                },
                {
                    status: 404,
                }
            );
        }

        const linkData = link[0];
        const now = new Date();
        const isExpired = linkData.expiresAt ? linkData.expiresAt < now : false;

        return NextResponse.json({
            shortId: linkData.shortId,
            longUrl: linkData.longUrl,
            clicks: linkData.clicks,
            createdAt: linkData.createdAt.toISOString(),
            lastAccess: linkData.lastAccess?.toISOString() || null,
            expiresAt: linkData.expiresAt?.toISOString(),
            status: isExpired ? 'expired' : 'active',
        });
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch link',
                },
            },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';