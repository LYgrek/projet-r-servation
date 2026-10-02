/**
 * Requêtes de lecture sur les réservations.
 */
import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activites, reservations, typeActivite, users, type Reservation } from "@/db/schema";

/** Réservation accompagnée des informations de l'activité concernée. */
export interface ReservationWithActivity extends Reservation {
  activite: {
    id: number;
    nom: string;
    typeNom: string;
    datetimeDebut: Date;
    duree: number;
  };
}

/** Réservation accompagnée de l'activité et de l'utilisateur (administration). */
export interface ReservationWithUser extends ReservationWithActivity {
  user: { id: number; prenom: string; nom: string; email: string };
}

const activityColumns = {
  id: activites.id,
  nom: activites.nom,
  typeNom: typeActivite.nom,
  datetimeDebut: activites.datetimeDebut,
  duree: activites.duree,
};

/** Réservations d'un utilisateur, les plus récentes en premier. */
export async function listUserReservations(userId: number): Promise<ReservationWithActivity[]> {
  const rows = await db
    .select({ reservation: reservations, activite: activityColumns })
    .from(reservations)
    .innerJoin(activites, eq(reservations.activiteId, activites.id))
    .innerJoin(typeActivite, eq(activites.typeId, typeActivite.id))
    .where(eq(reservations.userId, userId))
    .orderBy(desc(activites.datetimeDebut));

  return rows.map(({ reservation, activite }) => ({ ...reservation, activite }));
}

/** Réservation active d'un utilisateur pour une activité donnée, s'il en a une. */
export async function findActiveReservation(userId: number, activityId: number): Promise<Reservation | null> {
  const [row] = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.userId, userId), eq(reservations.activiteId, activityId), eq(reservations.etat, true)))
    .limit(1);
  return row ?? null;
}

/** Toutes les réservations (administration), les plus récentes en premier. */
export async function listAllReservations(limit?: number): Promise<ReservationWithUser[]> {
  const query = db
    .select({
      reservation: reservations,
      activite: activityColumns,
      user: { id: users.id, prenom: users.prenom, nom: users.nom, email: users.email },
    })
    .from(reservations)
    .innerJoin(activites, eq(reservations.activiteId, activites.id))
    .innerJoin(typeActivite, eq(activites.typeId, typeActivite.id))
    .innerJoin(users, eq(reservations.userId, users.id))
    .orderBy(desc(reservations.dateReservation), desc(reservations.id));

  const rows = limit ? await query.limit(limit) : await query;
  return rows.map(({ reservation, activite, user }) => ({ ...reservation, activite, user }));
}

/** Participants (réservations actives) d'une activité. */
export async function listActivityParticipants(
  activityId: number,
): Promise<{ id: number; prenom: string; nom: string; email: string }[]> {
  return db
    .select({ id: users.id, prenom: users.prenom, nom: users.nom, email: users.email })
    .from(reservations)
    .innerJoin(users, eq(reservations.userId, users.id))
    .where(and(eq(reservations.activiteId, activityId), eq(reservations.etat, true)));
}
