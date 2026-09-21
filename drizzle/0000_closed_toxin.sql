CREATE TABLE `curriculum_versions` (
	`version` text PRIMARY KEY NOT NULL,
	`item_count` integer NOT NULL,
	`set_count` integer NOT NULL,
	`seeded_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exam_answers` (
	`attempt_id` text NOT NULL,
	`item_id` text NOT NULL,
	`answer` text NOT NULL,
	`correct` integer NOT NULL,
	PRIMARY KEY(`attempt_id`, `item_id`)
);
--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`set_id` text NOT NULL,
	`stage` text NOT NULL,
	`seed` integer NOT NULL,
	`manifest` text NOT NULL,
	`score` integer,
	`passed` integer,
	`submitted_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `exam_user_set_idx` ON `exam_attempts` (`user_id`,`set_id`);--> statement-breakpoint
CREATE TABLE `game_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`set_id` text NOT NULL,
	`mode` text NOT NULL,
	`score` integer NOT NULL,
	`missed_item_ids` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `game_user_created_idx` ON `game_attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `mutation_receipts` (
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `request_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipt_user_request_idx` ON `mutation_receipts` (`user_id`,`request_id`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`auto_speech` integer DEFAULT true NOT NULL,
	`show_pinyin` integer DEFAULT true NOT NULL,
	`effects` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_set_progress` (
	`user_id` text NOT NULL,
	`set_id` text NOT NULL,
	`meaning_passed_at` text,
	`hanzi_passed_at` text,
	`tones_passed_at` text,
	`completed_at` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `set_id`)
);
--> statement-breakpoint
CREATE TABLE `user_word_progress` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`set_id` text NOT NULL,
	`status` text NOT NULL,
	`studied_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`)
);
--> statement-breakpoint
CREATE INDEX `word_user_set_idx` ON `user_word_progress` (`user_id`,`set_id`);--> statement-breakpoint
CREATE INDEX `word_user_updated_idx` ON `user_word_progress` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`set_id` text NOT NULL,
	`category` text NOT NULL,
	`hanzi` text NOT NULL,
	`pinyin` text NOT NULL,
	`thai` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocabulary_items_number_unique` ON `vocabulary_items` (`number`);--> statement-breakpoint
CREATE INDEX `vocab_set_idx` ON `vocabulary_items` (`set_id`);--> statement-breakpoint
CREATE TABLE `vocabulary_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`scheduled_date` text
);
