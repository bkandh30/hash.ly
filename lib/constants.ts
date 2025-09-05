export const LINK_CONFIG = {
    SHORT_ID_LENGTH: 7,
    SHORT_ID_ALPHABET: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    MAX_GENERATION_RETRIES: 5,
    EXPIRY_DAYS: 30,
    MAX_URL_LENGTH: 2048,
    MIN_URL_LENGTH: 1,
} as const;

export const RATE_LIMIT_CONFIG = {
    CREATE: 20,
    API: 20,
    REDIRECT: 100,
    WINDOW: '1 m',
} as const;

export const BATCH_CONFIG = {
    MAX_BATCH_SIZE: 50,
    POLL_INTERVAL: 10000,
    RETRY_BASE_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    JITTER_MAX: 1000,
} as const;

export const DB_CONFIG = {
    CONNECTION_TIMEOUT: 5000,
    MAX_RETRIES: 3,
} as const;

export const QR_CONFIG = {
    DEFAULT_SIZE: 256,
    MIN_SIZE: 64,
    MAX_SIZE: 1024,
    DEFAULT_MARGIN: 2,
    MIN_MARGIN: 0,
    MAX_MARGIN: 10,
    DEFAULT_FORMAT: 'png' as const,
    CACHE_DURATION: 2592000,
} as const;

export const API_MESSAGES = {
    LINK_NOT_FOUND: 'Link not found',
    LINK_EXPIRED: 'This link has expired',
    LINK_CREATED: 'Link created successfully',
    INVALID_REQUEST: 'Invalid request',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    INTERNAL_ERROR: 'An internal error occurred',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    GONE: 410,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const VALIDATION = {
    SHORT_ID_PATTERN: /^[A-Za-z0-9_-]{5,12}$/,
    URL_PROTOCOLS: ['http:', 'https:'] as const,
} as const;