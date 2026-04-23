CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_type` text DEFAULT 'post' NOT NULL,
	`target_id` integer,
	`user_id` integer,
	`nickname` text,
	`email` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`post_slug` text,
	`author` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_target_type_idx` ON `comments` (`target_type`);--> statement-breakpoint
CREATE INDEX `comments_target_id_idx` ON `comments` (`target_id`);--> statement-breakpoint
CREATE INDEX `comments_status_idx` ON `comments` (`status`);--> statement-breakpoint
CREATE INDEX `comments_post_slug_idx` ON `comments` (`post_slug`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`content` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE INDEX `posts_published_at_idx` ON `posts` (`published_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`content` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_published_at_idx` ON `projects` (`published_at`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_name` text DEFAULT 'My Blog' NOT NULL,
	`site_description` text DEFAULT '' NOT NULL,
	`homepage_intro` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`github_id` text NOT NULL,
	`username` text NOT NULL,
	`avatar_url` text,
	`role` text DEFAULT 'reader' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);