import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
    id: text('id').primaryKey(),
    shortId: text('short_id').notNull().unique(),
    longUrl: text('long_url').notNull(),
    clicks: integer('clicks').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    lastAccess: integer('last_access', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const shortIdIdx = index('short_id_idx').on(links.shortId);
export const expiresAtIdx = index('expires_at_idx').on(links.expiresAt);

export const clicks = sqliteTable('clicks', {
    id: text('id').primaryKey(),
    linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    referer: text('referer'),
    country: text('country'),
});

export const linkIdIdx = index('link_id_idx').on(clicks.linkId);
export const createdAtIdx = index('created_at_idx').on(clicks.createdAt);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;