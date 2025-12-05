import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const response = NextResponse.next();

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    response.headers.set('Link', '<https://vitals.vercel-insights.com>; rel=preconnect');

    if (request.nextUrl.pathname.startsWith('/static/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    if (request.nextUrl.pathname.match(/^\/api\/links\/[^\/]+\/qr$/)) {
        response.headers.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000');
    }

    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};