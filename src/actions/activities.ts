"use server";

/**
 * Server Actions d'administration des activités : création, modification, suppression.
 * Chaque action commence par `requireAdmin()` : un utilisateur simple ne peut
 * pas les exécuter, même en forgeant une requête à la main.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { activites, reservations, typeActivite } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/dal";
import { sendActivityCancelledByPark } from "@/lib/mail";
import { getActivity } from "@/lib/queries/activities";
import { listActivityParticipants } from "@/lib/queries/reservations";
import { activitySchema, formDataToObject, idSchema, toFieldErrors, type ActivityInput } from "@/lib/validation";

/** Rafraîchit les pages publiques et d'administration des activités. */
function revalidateActivityPages(): void {
  revalidatePath("/", "layout");
}

/** Valide le formulaire et vérifie que le type d'activité existe. */
async function parseActivityForm(
  formData: FormData,
): Promise<{ ok: true; data: ActivityInput } | { ok: false; state: ActionState }> {
  const raw = formDataToObject(formData);
  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, state: { status: "error", fieldErrors: toFieldErrors(parsed.error), values: raw } };
  }

  const [type] = await db
    .select({ id: typeActivite.id })
    .from(typeActivite)
    .where(eq(typeActivite.id, parsed.data.typeId))
    .limit(1);
  if (!type) {
    return { ok: false, state: { status: "error", fieldErrors: { typeId: ["Ce type n'existe pas."] }, values: raw } };
  }

  return { ok: true, data: parsed.data };
}

/** Crée une nouvelle activité. */
export async function createActivity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const result = await parseActivityForm(formData);
  if (!result.ok) return result.state;

  if (result.data.datetimeDebut <= new Date()) {
    return {
      status: "error",
      fieldErrors: { datetimeDebut: ["La date de début doit être dans le futur."] },
      values: formDataToObject(formData),
    };
  }

  await db.insert(activites).values(result.data);
  revalidateActivityPages();
  redirect("/admin/activites?succes=creee");
}

/** Modifie une activité existante. */
export async function updateActivity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Activité invalide." };

  const existing = await getActivity(id.data);
  if (!existing) return { status: "error", message: "Cette activité n'existe plus." };

  const result = await parseActivityForm(formData);
  if (!result.ok) return result.state;

  // On ne peut pas réduire la capacité sous le nombre de réservations déjà prises.
  if (result.data.placesDisponibles < existing.placesReservees) {
    return {
      status: "error",
      fieldErrors: {
        placesDisponibles: [`${existing.placesReservees} place(s) sont déjà réservées : la capacité ne peut pas être inférieure.`],
      },
      values: formDataToObject(formData),
    };
  }

  await db.update(activites).set(result.data).where(eq(activites.id, id.data));
  revalidateActivityPages();
  redirect("/admin/activites?succes=modifiee");
}

/**
 * Supprime une activité et ses réservations.
 * Les participants ayant une réservation active sont prévenus par email.
 */
export async function deleteActivity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Activité invalide." };

  const activity = await getActivity(id.data);
  if (!activity) return { status: "error", message: "Cette activité a déjà été supprimée." };

  const participants = activity.datetimeDebut > new Date() ? await listActivityParticipants(activity.id) : [];

  await db.batch([
    db.delete(reservations).where(eq(reservations.activiteId, activity.id)),
    db.delete(activites).where(eq(activites.id, activity.id)),
  ]);

  for (const participant of participants) void sendActivityCancelledByPark(participant, activity);

  revalidateActivityPages();
  return {
    status: "success",
    message:
      participants.length > 0
        ? `« ${activity.nom} » a été supprimée. ${participants.length} participant(s) ont été prévenu(s) par email.`
        : `« ${activity.nom} » a été supprimée.`,
  };
}
