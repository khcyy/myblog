ALTER TABLE users ADD COLUMN email TEXT;
--> statement-breakpoint
CREATE TABLE `login_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`github_id` text NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`ip` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_logs_user_id_idx` ON `login_logs` (`user_id`);
--> statement-breakpoint
CREATE INDEX `login_logs_github_id_idx` ON `login_logs` (`github_id`);
--> statement-breakpoint
CREATE INDEX `login_logs_created_at_idx` ON `login_logs` (`created_at`);
