import { drizzle } from "drizzle-orm/libsql";
import { links, clicks } from "./schema";
import { createClient } from "@libsql/client";
import { validateEnv } from "./env";

const schema = { links, clicks };

validateEnv();

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