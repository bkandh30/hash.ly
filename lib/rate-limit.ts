import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
    create: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        analytics: true,
        prefix: 'ratelimit:create',
    }),

    api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'ratelimit:api',
    }),

    redirect: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:redirect',
    }),
};

export function getClientId(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    const ip = forwardedFor?.split(',')[0]?.trim() ||
                realIp ||
                cfConnectingIp ||
                'anonymous';

    return ip;
}

export async function checkRateLimit(
    request: Request,
    type: keyof typeof rateLimiters = 'api',
): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date
}> {
    const clientId = getClientId(request);
    const { success, limit, remaining, reset } = await rateLimiters[type].limit(clientId);

    return {
        success,
        limit,
        remaining,
        reset: new Date(reset),
    };
}

export async function withRateLimit(
    request: Request,
    type: keyof typeof rateLimiters = 'api'
): Promise<Response | null> {
    const result = await checkRateLimit(request, type);

    if (!result.success) {
        return new Response(
            JSON.stringify({
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
                },
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': result.limit.toString(),
                    'X-RateLimit-Remaining': result.remaining.toString(),
                    'X-RateLimit-Reset': result.reset.getTime().toString(),
                    'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    return null;
}

export { redis };