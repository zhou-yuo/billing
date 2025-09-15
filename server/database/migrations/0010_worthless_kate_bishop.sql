CREATE TABLE `app_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`payer_id` text NOT NULL,
	`participants` text NOT NULL,
	`type` text NOT NULL,
	`borrower_id` text,
	`lender_id` text,
	`creator_uid` text NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`settled_by_uid` text,
	`period` integer NOT NULL,
	`transaction_date` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-09-15T17:31:27.414Z"' NOT NULL,
	FOREIGN KEY (`payer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`borrower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_uid`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`settled_by_uid`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "description", "amount", "payer_id", "participants", "type", "borrower_id", "lender_id", "creator_uid", "status", "settled_by_uid", "period", "transaction_date", "created_at") SELECT "id", "description", "amount", "payer_id", "participants", "type", "borrower_id", "lender_id", "creator_uid", "status", "settled_by_uid", "period", "transaction_date", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;