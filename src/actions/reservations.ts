"use server";

/**
 * Server Actions des réservations : création et annulation.
 *
 * Règles métier vérifiées côté serveur :
 * - il faut être connecté ;
 * - impossible de réserver une activité passée, complète ou déjà réservée ;
 * - impossible d'annuler une réservation qui ne nous appartient pas,
 *   déjà annulée, ou dont l'activité a commencé.
 */
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activites, reservations } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/dal";
import { sendReservationCancellation, sendReservationConfirmation } from "@/lib/mail";
import { getActivity } from "@/lib/queries/activities";
import { findActiveReservation } from "@/lib/queries/reservations";
import { idSchema } from "@/lib/validation";

/** Rafraîchit toutes les pages qui affichent des places ou des réservations. */
function revalidateReservationPages(activityId: number): void {
  revalidatePath("/activites");
  revalidatePath(`/activites/${activityId}`);
  revalidatePath("/reservations");
  revalidatePath("/admin", "layout");
}

/** Réserve une place pour l'utilisateur connecté. */
export async function createReservation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsedId = idSchema.safeParse(formData.get("activiteId"));
  if (!parsedId.success) return { status: "error", message: "Activité invalide." };
  const activityId = parsedId.data;

  const user = await requireUser(`/activites/${activityId}`);

  const activity = await getActivity(activityId);
  if (!activity) return { status: "error", message: "Cette activité n'existe plus." };
  if (activity.datetimeDebut <= new Date()) {
    return { status: "error", message: "Cette activité a déjà commencé, elle ne peut plus être réservée." };
  }
  if (await findActiveReservation(user.id, activityId)) {
    return { status: "error", message: "Vous avez déjà réservé cette activité." };
  }
  if (activity.placesRestantes <= 0) {
    return { status: "error", message: "Désolé, cette activité est complète." };
  }

  // Insertion conditionnelle en UNE seule requête SQL (donc atomique) :
  // même si deux personnes réservent la dernière place au même instant,
  // une seule insertion réussira.
  const result = await db.run(sql`
    INSERT INTO ${reservations} (user_id, activite_id, date_reservation, etat)
    SELECT ${user.id}, ${activityId}, unixepoch(), 1
    WHERE (
      SELECT count(*) FROM ${reservations}
      WHERE activite_id = ${activityId} AND etat = 1
    ) < (SELECT ${activites.placesDisponibles} FROM ${activites} WHERE ${activites.id} = ${activityId})
    AND NOT EXISTS (
      SELECT 1 FROM ${reservations}
      WHERE user_id = ${user.id} AND activite_id = ${activityId} AND etat = 1
    )
  `);

  if (result.rowsAffected === 0) {
    return { status: "error", message: "Désolé, la dernière place vient d'être réservée." };
  }

  void sendReservationConfirmation(user, activity);
  revalidateReservationPages(activityId);
  return { status: "success", message: `Réservation confirmée pour « ${activity.nom} » !` };
}

/** Annule une réservation de l'utilisateur connecté. */
export async function cancelReservation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsedId = idSchema.safeParse(formData.get("reservationId"));
  if (!parsedId.success) return { status: "error", message: "Réservation invalide." };

  const user = await requireUser("/reservations");

  const [reservation] = await db
    .select({
      id: reservations.id,
      userId: reservations.userId,
      etat: reservations.etat,
      activiteId: activites.id,
      nom: activites.nom,
      datetimeDebut: activites.datetimeDebut,
      duree: activites.duree,
    })
    .from(reservations)
    .innerJoin(activites, eq(reservations.activiteId, activites.id))
    .where(eq(reservations.id, parsedId.data))
    .limit(1);

  // Une réservation qui n'appartient pas à l'utilisateur est traitée comme
  // inexistante : on ne révèle pas son existence.
  if (!reservation || reservation.userId !== user.id) {
    return { status: "error", message: "Réservation introuvable." };
  }
  if (!reservation.etat) return { status: "error", message: "Cette réservation est déjà annulée." };
  if (reservation.datetimeDebut <= new Date()) {
    return { status: "error", message: "L'activité a déjà commencé, la réservation ne peut plus être annulée." };
  }

  // La condition sur `user_id` est répétée dans la requête par sécurité.
  await db
    .update(reservations)
    .set({ etat: false })
    .where(and(eq(reservations.id, reservation.id), eq(reservations.userId, user.id)));

  void sendReservationCancellation(user, reservation);
  revalidateReservationPages(reservation.activiteId);
  return { status: "success", message: "Votre réservation a bien été annulée." };
}
