/**
 * Requêtes de lecture sur les utilisateurs (administration).
 */
import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { reservations, users, type PublicUser } from "@/db/schema";

export interface UserWithStats extends PublicUser {
  nbReservations: number;
}

/** Liste des utilisateurs avec leur nombre de réservations actives. */
export async function listUsers(): Promise<UserWithStats[]> {
  const rows = await db
    .select({
      // Le mot de passe n'est volontairement jamais sélectionné.
      id: users.id,
      prenom: users.prenom,
      nom: users.nom,
      email: users.email,
      role: users.role,
      nbReservations: sql<number>`sum(case when ${reservations.etat} = 1 then 1 else 0 end)`.mapWith(Number),
    })
    .from(users)
    .leftJoin(reservations, eq(reservations.userId, users.id))
    .groupBy(users.id)
    .orderBy(asc(users.nom), asc(users.prenom));

  return rows.map((row) => ({ ...row, nbReservations: row.nbReservations || 0 }));
}

/** Nombre d'administrateurs (pour empêcher la suppression du dernier). */
export async function countAdmins(): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(users).where(eq(users.role, "admin"));
  return row?.n ?? 0;
}
