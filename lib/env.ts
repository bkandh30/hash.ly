export function validateEnv() {
    const required = [
        'TURSO_DATABASE_URL',
        'TURSO_AUTH_TOKEN',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log('Environment variables validated successfully');
    }
}