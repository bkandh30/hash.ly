export class ValidationError extends Error {
    constructor(message: string, public code: string = 'INVALID_URL') {
        super(message);
        this.name = 'ValidationError';
    }
}

const BLOCKED_PATTERNS = [
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i,
    /^https?:\/\/10\./i,
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./i,
    /^https?:\/\/192\.168\./i,
    /^https?:\/\/169\.254\./i,
    /^https?:\/\/\[::1\]/i,
    /^https?:\/\/\[fc00::/i,
    /^https?:\/\/\[fd00::/i,
];

const BLOCKED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254',
];

export async function validateUrl(url: string): Promise<string> {
    url = url.trim();

    if (!url) {
        throw new ValidationError('URL is required', 'MISSING_URL');
    }

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch (error) {
        throw new ValidationError('Invalid URL Format', 'INVALID_URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) {
        throw new ValidationError('Only HTTP and HTTPS URLs are allowed', 'INVALID_PROTOCOL');
    }

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTS.includes(hostname)) {
        throw new ValidationError('URL points to a blocked host', 'BLOCKED_HOST');
    }

    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(url)) {
            throw new ValidationError('URL points to a blocked network range', 'BLOCKED_NETWORK');
        }
    }

    parsed.hash = '';

    const trackingParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'gclid'
    ];
    const searchParams = parsed.searchParams;

    trackingParams.forEach(param => searchParams.delete(param));

    return parsed.toString();
}

export function validateShortId(shortId: string): boolean {
    const pattern = /^[A-Za-z0-9_-]{5,12}$/;
    return pattern.test(shortId);
}