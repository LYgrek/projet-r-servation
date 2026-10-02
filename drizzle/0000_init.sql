CREATE TABLE `activites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`type_id` integer NOT NULL,
	`places_disponibles` integer NOT NULL,
	`description` text NOT NULL,
	`datetime_debut` integer NOT NULL,
	`duree` integer NOT NULL,
	FOREIGN KEY (`type_id`) REFERENCES `type_activite`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `activites_type_idx` ON `activites` (`type_id`);--> statement-breakpoint
CREATE INDEX `activites_debut_idx` ON `activites` (`datetime_debut`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`activite_id` integer NOT NULL,
	`date_reservation` integer DEFAULT (unixepoch()) NOT NULL,
	`etat` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`activite_id`) REFERENCES `activites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reservations_user_idx` ON `reservations` (`user_id`);--> statement-breakpoint
CREATE INDEX `reservations_activite_idx` ON `reservations` (`activite_id`);--> statement-breakpoint
CREATE TABLE `type_activite` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `type_activite_nom_unique` ON `type_activite` (`nom`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prenom` text NOT NULL,
	`nom` text NOT NULL,
	`email` text NOT NULL,
	`motdepasse` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);