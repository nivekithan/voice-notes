CREATE TABLE `custom_prompt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`system_message` text NOT NULL,
	`update_system_messsage` text NOT NULL
);
