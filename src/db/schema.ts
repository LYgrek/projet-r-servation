/**
 * Schéma de la base de données (SQLite via Drizzle ORM).
 *
 * Les noms de tables et de colonnes respectent le cahier des charges
 * (users, type_activite, activites, reservations). Côté TypeScript, les
 * propriétés sont exposées en camelCase.
 */
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Rôles possibles d'un utilisateur. */
export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Table des utilisateurs. Le mot de passe est stocké haché (bcrypt). */
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prenom: text("prenom").notNull(),
    nom: text("nom").notNull(),
    email: text("email").notNull(),
    motdepasse: text("motdepasse").notNull(),
    role: text("role", { enum: ROLES }).notNull().default("user"),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

/** Table des types d'activité (Accrobranche, Escalade, ...). */
export const typeActivite = sqliteTable(
  "type_activite",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
  },
  (table) => [uniqueIndex("type_activite_nom_unique").on(table.nom)],
);

/**
 * Table des activités.
 * - `placesDisponibles` : capacité totale de l'activité. Le nombre de places
 *   restantes est calculé à partir des réservations actives.
 * - `datetimeDebut` : date/heure de début (stockée en timestamp Unix).
 * - `duree` : durée en minutes.
 */
export const activites = sqliteTable(
  "activites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    typeId: integer("type_id")
      .notNull()
      .references(() => typeActivite.id, { onDelete: "restrict" }),
    placesDisponibles: integer("places_disponibles").notNull(),
    description: text("description").notNull(),
    datetimeDebut: integer("datetime_debut", { mode: "timestamp" }).notNull(),
    duree: integer("duree").notNull(),
  },
  (table) => [index("activites_type_idx").on(table.typeId), index("activites_debut_idx").on(table.datetimeDebut)],
);

/**
 * Table des réservations.
 * - `etat` : `true` (réservation active, valeur par défaut) ou `false` (annulée).
 */
export const reservations = sqliteTable(
  "reservations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activiteId: integer("activite_id")
      .notNull()
      .references(() => activites.id, { onDelete: "cascade" }),
    dateReservation: integer("date_reservation", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    etat: integer("etat", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [index("reservations_user_idx").on(table.userId), index("reservations_activite_idx").on(table.activiteId)],
);

/* ---------- Relations (utilisées par l'API relationnelle de Drizzle) ---------- */

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));

export const typeActiviteRelations = relations(typeActivite, ({ many }) => ({
  activites: many(activites),
}));

export const activitesRelations = relations(activites, ({ one, many }) => ({
  type: one(typeActivite, { fields: [activites.typeId], references: [typeActivite.id] }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  activite: one(activites, { fields: [reservations.activiteId], references: [activites.id] }),
}));

/* ---------- Types inférés ---------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TypeActivite = typeof typeActivite.$inferSelect;
export type Activite = typeof activites.$inferSelect;
export type NewActivite = typeof activites.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;

/** Utilisateur sans son mot de passe : c'est la seule forme exposée aux composants. */
export type PublicUser = Omit<User, "motdepasse">;
