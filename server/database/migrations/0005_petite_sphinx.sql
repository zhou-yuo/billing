PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`transaction_date` integer NOT NULL,
	`payer_id` text NOT NULL,
	`participants` text NOT NULL,
	`type` text NOT NULL,
	`borrower_id` text,
	`lender_id` text,
	`created_at` integer DEFAULT '"2025-09-15T08:06:34.631Z"' NOT NULL,
	FOREIGN KEY (`payer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`borrower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "description", "amount", "transaction_date", "payer_id", "participants", "type", "borrower_id", "lender_id", "created_at") SELECT "id", "description", "amount", "transaction_date", "payer_id", "participants", "type", "borrower_id", "lender_id", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;