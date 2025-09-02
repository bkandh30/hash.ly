import { drizzle } from "drizzle-orm/libsql";
import { links, clicks } from "./schema";
import { createClient } from "@libsql/client";

const schema = { links, clicks };

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("Database credentials are not set in environment variables");
}

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

const globalForDb = globalThis as unknown as {
    db: ReturnType<typeof drizzle> | undefined;
};

export const db = globalForDb.db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
}

export default db;