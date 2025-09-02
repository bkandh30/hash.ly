import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
    id: text('id').primaryKey(),
    shortId: text('short_id').notNull().unique(),
    longUrl: text('long_url').notNull(),
    clicks: integer('clicks').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    lastAcces: integer('last_access', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const shortIdIdx = index('short_id_idx').on(links.shortId);
export const expiresAtIdx = index('expires_at_idx').on(links.expiresAt);