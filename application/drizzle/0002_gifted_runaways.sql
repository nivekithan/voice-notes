CREATE TABLE `spelling_mistake` (
	`id` text NOT NULL,
	`spelling_mistake` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spelling_mistake_id_unique` ON `spelling_mistake` (`id`);