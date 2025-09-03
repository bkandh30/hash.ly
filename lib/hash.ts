import { createHash } from 'crypto';

const IP_SALT = process.env.IP_SALT || 'ip-salt';

export function hashIp(ip: string): string {
    return createHash('sha256')
        .update(ip + IP_SALT)
        .digest('hex')
        .substring(0, 16);
}

export function getClientIP(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    const ip = forwardedFor?.split(',')[0]?.trim() ||
                realIp ||
                cfConnectingIp ||
                'anonymous';

    return ip;
}

export function getUserAgent(request: Request): string | null {
    const ua = request.headers.get('user-agent');
    return ua?.substring(0, 255) || null;
}

export function getReferer(request: Request): string | null {
    const referer = request.headers.get('referer');
    return referer?.substring(0, 255) || null;
}

export function getCountry(request: Request): string | null {
    const country = request.headers.get('cf-ipcountry');

    const vercelCountry = request.headers.get('x-vercel-ip-country');

    return country || vercelCountry || null;
}