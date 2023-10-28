DROP INDEX IF EXISTS `spelling_mistake_id_unique`;--> statement-breakpoint
ALTER TABLE spelling_mistake ADD `userId` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `spelling_mistake_userId_unique` ON `spelling_mistake` (`userId`);