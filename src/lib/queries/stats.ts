/**
 * Statistiques du tableau de bord administrateur (bonus).
 */
import "server-only";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { activites, reservations, typeActivite, users } from "@/db/schema";

export interface DashboardStats {
  nbUtilisateurs: number;
  nbAdmins: number;
  nbActivitesAVenir: number;
  nbActivitesTotal: number;
  nbReservationsActives: number;
  nbReservationsAnnulees: number;
  /** Part des réservations annulées, entre 0 et 1. */
  tauxAnnulation: number;
  /** Taux de remplissage moyen des activités à venir, entre 0 et 1. */
  tauxRemplissage: number;
  /** Réservations actives par type d'activité. */
  parType: { typeNom: string; reservations: number }[];
}

/** Calcule l'ensemble des indicateurs du tableau de bord. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  // Les dates sont stockées en secondes Unix : nécessaire pour les comparaisons en SQL brut.
  const nowSeconds = Math.floor(now.getTime() / 1000);

  const [userStats, activityStats, reservationStats, fillStats, parType] = await Promise.all([
    db
      .select({ total: count(), admins: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)` })
      .from(users),
    db
      .select({ total: count(), aVenir: sql<number>`sum(case when ${activites.datetimeDebut} >= ${nowSeconds} then 1 else 0 end)` })
      .from(activites),
    db
      .select({ actives: sql<number>`sum(case when ${reservations.etat} = 1 then 1 else 0 end)`, total: count() })
      .from(reservations),
    // Capacité et réservations des activités à venir.
    db
      .select({
        capacite: sql<number>`coalesce(sum(${activites.placesDisponibles}), 0)`,
        reservees: sql<number>`coalesce(sum((select count(*) from ${reservations} r where r.activite_id = ${activites.id} and r.etat = 1)), 0)`,
      })
      .from(activites)
      .where(gte(activites.datetimeDebut, now)),
    db
      .select({ typeNom: typeActivite.nom, reservations: count(reservations.id) })
      .from(typeActivite)
      .leftJoin(activites, eq(activites.typeId, typeActivite.id))
      .leftJoin(reservations, and(eq(reservations.activiteId, activites.id), eq(reservations.etat, true)))
      .groupBy(typeActivite.id)
      .orderBy(sql`count(${reservations.id}) desc`),
  ]);

  const actives = Number(reservationStats[0]?.actives ?? 0);
  const totalReservations = Number(reservationStats[0]?.total ?? 0);
  const capacite = Number(fillStats[0]?.capacite ?? 0);
  const reservees = Number(fillStats[0]?.reservees ?? 0);

  return {
    nbUtilisateurs: Number(userStats[0]?.total ?? 0),
    nbAdmins: Number(userStats[0]?.admins ?? 0),
    nbActivitesTotal: Number(activityStats[0]?.total ?? 0),
    nbActivitesAVenir: Number(activityStats[0]?.aVenir ?? 0),
    nbReservationsActives: actives,
    nbReservationsAnnulees: totalReservations - actives,
    tauxAnnulation: totalReservations === 0 ? 0 : (totalReservations - actives) / totalReservations,
    tauxRemplissage: capacite === 0 ? 0 : reservees / capacite,
    parType: parType.map((row) => ({ typeNom: row.typeNom, reservations: Number(row.reservations) })),
  };
}
