CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`referer` text,
	`country` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` text NOT NULL,
	`long_url` text NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`last_access` integer,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_short_id_unique` ON `links` (`short_id`);