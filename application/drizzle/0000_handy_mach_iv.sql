CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text,
	`transcript` text,
	`status` text DEFAULT 'CREATED' NOT NULL,
	`userId` text NOT NULL,
	`createdAt` text NOT NULL
);
