import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validateShortId } from "@/lib/validate";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shortId: string }> }
) {
    try {
        const { shortId } = await params;

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
            .select({ shortId: links.shortId })
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
                { status: 404 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('fmt') || 'png';
        const size = Math.min(Math.max(parseInt(searchParams.get('size') || '256'), 64), 1024);
        const margin = Math.min(Math.max(parseInt(searchParams.get('margin') || '2'), 0), 10);

        if (!['png', 'svg'].includes(format)) {
            return NextResponse.json(
                {
                    error: {
                        code: 'INVALID_FORMAT',
                        message: 'Invalid format',
                    },
                },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const fullUrl = `${appUrl}/s/${shortId}`;

        if (format === 'svg') {
            const svg = await QRCode.toString(fullUrl, {
                type: 'svg',
                width: size,
                margin,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });

            return new NextResponse(svg, {
                status: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=604800',
                    'ETag': `"${shortId}-${size}-${margin}-svg"`,
                },
            });
        } else {
            const buffer = await QRCode.toBuffer(fullUrl, {
                type: 'png',
                width: size,
                margin,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });

            return new NextResponse(new Uint8Array(buffer), {
                status: 200,
                headers: {
                    'Content-Type': format === 'svg' ? 'image/svg+xml' : 'image/png',
                    'Cache-Control': 'public, max-age=2592000, immutable',
                    'ETag': `"${shortId}-${size}-${margin}-${format}"`,
                    'Vary': 'Accept-Encoding',
                },
            });
        }
    } catch (error) {
        console.error('Error generating QR code:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to generate QR code',
                },
            },
            { status: 500 }
        );
    }
}

//export const runtime = 'edge';