import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links, clicks } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { validateShortId } from '@/lib/validate';
import { withRateLimit } from '@/lib/rate-limit';
import { hashIp, getClientIP, getUserAgent, getReferer, getCountry } from '@/lib/hash';
import { createId } from '@/lib/id';

export async function GET(
    request: NextRequest,
    { params }: { params: { shortId: string } }
) {
    try {
        const rateLimitResponse = await withRateLimit(request, 'redirect');
        if (rateLimitResponse) return rateLimitResponse;
        
        const { shortId } = await params;
        
        if (!validateShortId(shortId)) {
            return new NextResponse('Invalid link', { status: 400 });
        }
        
        const link = await db
            .select()
            .from(links)
            .where(eq(links.shortId, shortId))
            .limit(1);
        
        if (link.length === 0) {
            return new NextResponse(
                `<!DOCTYPE html>
        <html>
          <head>
            <title>404 - Link Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #333; margin-bottom: 0.5rem; }
              p { color: #666; margin-top: 0.5rem; }
              a { color: #3b82f6; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404</h1>
              <p>Link not found</p>
              <p><a href="/">Go to homepage</a></p>
            </div>
          </body>
        </html>`,
                {
                    status: 404,
                    headers: { 'Content-Type': 'text/html' },
                }
            );
        }
        
        const linkData = link[0];
        const now = new Date();
        
        if (linkData.expiresAt && linkData.expiresAt < now) {
            return new NextResponse(
                `<!DOCTYPE html>
        <html>
          <head>
            <title>410 - Link Expired</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #333; margin-bottom: 0.5rem; }
              p { color: #666; margin-top: 0.5rem; }
              .expired { color: #ef4444; font-weight: 500; }
              a { color: #3b82f6; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>410</h1>
              <p class="expired">This link has expired</p>
              <p>Links expire after 30 days</p>
              <p><a href="/">Create a new link</a></p>
            </div>
          </body>
        </html>`,
                {
                    status: 410,
                    headers: { 'Content-Type': 'text/html' },
                }
            );
        }
        
        await db
            .update(links)
            .set({
                clicks: sql`${links.clicks} + 1`,
                lastAccess: now,
            })
            .where(eq(links.id, linkData.id));
        
        const clientIP = getClientIP(request);
        const ipHash = clientIP !== 'unknown' ? hashIp(clientIP) : null;
        
        await db.insert(clicks)
            .values({
                id: createId(),
                linkId: linkData.id,
                createdAt: now,
                ipHash,
                userAgent: getUserAgent(request),
                referer: getReferer(request),
                country: getCountry(request),
            })
            .catch((error) => {
                console.error('Failed to record click analytics:', error);
            });

        return NextResponse.redirect(linkData.longUrl, 301);
    } catch (error) {
        console.error('Error processing redirect:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

// export const runtime = 'edge';