import { customAlphabet } from 'nanoid';
import { db } from './db';
import { links } from './schema';
import { eq } from 'drizzle-orm';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const SHORT_ID_LENGTH = 7;

const generateId = customAlphabet(alphabet, SHORT_ID_LENGTH);

export async function generateShortId(maxRetries: number = 5): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const shortId = generateId();

        const existing = await db
            .select({ id: links.id })
            .from(links)
            .where(eq(links.shortId, shortId))
            .limit(1);

        if (existing.length === 0) {
            return shortId;
        }

        console.warn(`Collision detected for ID: ${shortId}, attempt ${attempt + 1} of ${maxRetries}`);
    }

    throw new Error(`Failed to generate a unique ID after ${maxRetries} attempts`);
}

export function createId(): string {
    return customAlphabet(alphabet, 16)();
}