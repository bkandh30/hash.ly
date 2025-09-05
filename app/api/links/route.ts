import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { links } from "@/lib/schema";
import { validateUrl, ValidationError } from "@/lib/validate";
import { generateShortId, createId } from "@/lib/id";
import { withRateLimit } from "@/lib/rate-limit";
import { LINK_CONFIG } from "@/lib/constants";

const createLinkSchema = z.object({
    longUrl: z.url().min(LINK_CONFIG.MIN_URL_LENGTH).max(LINK_CONFIG.MAX_URL_LENGTH),
});

export async function POST(request: NextRequest) {
    try {
        const rateLimitResponse = await withRateLimit(request, 'create');
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();

        const validation = createLinkSchema.safeParse(body);
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

        let normalizedUrl: string;
        try {
            normalizedUrl = await validateUrl(validation.data.longUrl);
        } catch (error) {
            if (error instanceof ValidationError) {
                return NextResponse.json(
                    {
                        error: {
                            code: error.code,
                            message: error.message,
                        },
                    },
                );
            }
            throw error;
        }

        const shortId = await generateShortId();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + LINK_CONFIG.EXPIRY_DAYS);

        const linkId = createId();
        await db.insert(links).values({
            id: linkId,
            shortId,
            longUrl: normalizedUrl,
            clicks: 0,
            createdAt: new Date(),
            expiresAt,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.json(
            {
                shortId,
                shortUrl: `${appUrl}/s/${shortId}`,
                longUrl: normalizedUrl,
                createdAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString(),
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error('Error creating link:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create link',
                },
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const rateLimitResponse = await withRateLimit(request, 'api');

        if (rateLimitResponse)
            return rateLimitResponse;

        const recentLinks = await db
            .select()
            .from(links)
            .orderBy(desc(links.createdAt))
            .limit(25);

        return NextResponse.json({
            links: recentLinks,
            count: recentLinks.length,
        });
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch links',
                },
            },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';