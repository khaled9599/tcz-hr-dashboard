CREATE TABLE `campaigns` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`source_type` varchar(32) NOT NULL,
	`source_campaign_id` varchar(160),
	`normalized_name` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` varchar(40) NOT NULL,
	`objective` varchar(80),
	`status` varchar(32) NOT NULL DEFAULT 'Active',
	`start_date` datetime,
	`end_date` datetime,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_source_uq` UNIQUE(`client_id`,`source_type`,`source_campaign_id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'Africa/Cairo',
	`currency` varchar(3) NOT NULL DEFAULT 'EGP',
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`kind` varchar(32) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`source_type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL,
	`rows_checked` int NOT NULL DEFAULT 0,
	`created_records` int NOT NULL DEFAULT 0,
	`updated_records` int NOT NULL DEFAULT 0,
	`duplicate_records` int NOT NULL DEFAULT 0,
	`invalid_records` int NOT NULL DEFAULT 0,
	`error_summary` text,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.135',
	`completed_at` datetime,
	CONSTRAINT `imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`campaign_id` varchar(36),
	`source_type` varchar(32) NOT NULL,
	`source_id` varchar(190),
	`dedupe_key` varchar(64) NOT NULL,
	`source_row_hash` varchar(64) NOT NULL,
	`source_row_number` int,
	`submitted_at` datetime NOT NULL,
	`name` varchar(255),
	`phone` varchar(80),
	`email` varchar(255),
	`campaign_name` varchar(255),
	`platform` varchar(40),
	`source` varchar(120),
	`form_name` varchar(255),
	`location` varchar(160),
	`status` varchar(32) NOT NULL DEFAULT 'New',
	`qualification_status` varchar(32) NOT NULL DEFAULT 'Pending',
	`custom_fields` json,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_source_uq` UNIQUE(`client_id`,`source_type`,`source_id`)
);
--> statement-breakpoint
CREATE TABLE `performance_records` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`campaign_id` varchar(36),
	`source_type` varchar(32) NOT NULL,
	`source_record_id` varchar(190),
	`record_date` datetime NOT NULL,
	`spend` decimal(16,4) NOT NULL DEFAULT '0',
	`reach` int NOT NULL DEFAULT 0,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`link_clicks` int NOT NULL DEFAULT 0,
	`platform_leads` int NOT NULL DEFAULT 0,
	`raw_metadata` json,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `performance_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `performance_source_uq` UNIQUE(`client_id`,`source_type`,`source_record_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`last_seen_at` datetime NOT NULL,
	`user_agent` varchar(500),
	`ip_hash` varchar(64),
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_uq` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `sync_events` (
	`id` varchar(36) NOT NULL,
	`sync_log_id` varchar(36) NOT NULL,
	`event_type` varchar(32) NOT NULL,
	`source_row_number` int,
	`record_key` varchar(190),
	`message` varchar(500) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.135',
	CONSTRAINT `sync_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_jobs` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`source_type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL,
	`lock_key` varchar(190) NOT NULL,
	`locked_until` datetime,
	`started_at` datetime NOT NULL,
	`ended_at` datetime,
	`last_successful_at` datetime,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `sync_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`sync_job_id` varchar(36),
	`source_type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL,
	`started_at` datetime NOT NULL,
	`ended_at` datetime,
	`rows_checked` int NOT NULL DEFAULT 0,
	`created_records` int NOT NULL DEFAULT 0,
	`updated_records` int NOT NULL DEFAULT 0,
	`duplicate_records` int NOT NULL DEFAULT 0,
	`failed_records` int NOT NULL DEFAULT 0,
	`error_message` text,
	CONSTRAINT `sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_clients` (
	`user_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`role` varchar(32) NOT NULL DEFAULT 'viewer',
	CONSTRAINT `user_clients_uq` UNIQUE(`user_id`,`client_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(160) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(32) NOT NULL DEFAULT 'client_viewer',
	`disabled_at` datetime,
	`created_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	`updated_at` datetime NOT NULL DEFAULT '2026-09-14 08:09:15.134',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imports` ADD CONSTRAINT `imports_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imports` ADD CONSTRAINT `imports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_records` ADD CONSTRAINT `performance_records_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_records` ADD CONSTRAINT `performance_records_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sync_events` ADD CONSTRAINT `sync_events_sync_log_id_sync_logs_id_fk` FOREIGN KEY (`sync_log_id`) REFERENCES `sync_logs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sync_jobs` ADD CONSTRAINT `sync_jobs_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sync_logs` ADD CONSTRAINT `sync_logs_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sync_logs` ADD CONSTRAINT `sync_logs_sync_job_id_sync_jobs_id_fk` FOREIGN KEY (`sync_job_id`) REFERENCES `sync_jobs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_clients` ADD CONSTRAINT `user_clients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_clients` ADD CONSTRAINT `user_clients_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `campaign_client_status_idx` ON `campaigns` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `campaign_normalized_name_idx` ON `campaigns` (`client_id`,`normalized_name`);--> statement-breakpoint
CREATE INDEX `imports_client_date_idx` ON `imports` (`client_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `leads_dedupe_idx` ON `leads` (`client_id`,`dedupe_key`);--> statement-breakpoint
CREATE INDEX `leads_client_date_idx` ON `leads` (`client_id`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `leads_campaign_idx` ON `leads` (`client_id`,`campaign_id`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`client_id`,`status`,`qualification_status`);--> statement-breakpoint
CREATE INDEX `performance_client_date_idx` ON `performance_records` (`client_id`,`record_date`);--> statement-breakpoint
CREATE INDEX `performance_campaign_date_idx` ON `performance_records` (`campaign_id`,`record_date`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sync_events_log_idx` ON `sync_events` (`sync_log_id`,`event_type`);--> statement-breakpoint
CREATE INDEX `sync_jobs_lock_idx` ON `sync_jobs` (`lock_key`,`locked_until`);--> statement-breakpoint
CREATE INDEX `sync_logs_client_date_idx` ON `sync_logs` (`client_id`,`started_at`);