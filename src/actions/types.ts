"use server";

/**
 * Server Actions d'administration des types d'activité.
 */
import { count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activites, typeActivite } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/dal";
import { formDataToObject, idSchema, toFieldErrors, typeSchema } from "@/lib/validation";

/** Vérifie qu'aucun autre type ne porte déjà ce nom (comparaison insensible à la casse). */
async function isNameTaken(nom: string, exceptId?: number): Promise<boolean> {
  const all = await db
    .select({ nom: typeActivite.nom })
    .from(typeActivite)
    .where(exceptId ? ne(typeActivite.id, exceptId) : undefined);
  return all.some((type) => type.nom.toLocaleLowerCase("fr") === nom.toLocaleLowerCase("fr"));
}

/** Crée un type d'activité. */
export async function createType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);

  const parsed = typeSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error), values: raw };
  if (await isNameTaken(parsed.data.nom)) {
    return { status: "error", fieldErrors: { nom: ["Ce type existe déjà."] }, values: raw };
  }

  await db.insert(typeActivite).values(parsed.data);
  revalidatePath("/", "layout");
  return { status: "success", message: `Le type « ${parsed.data.nom} » a été créé.` };
}

/** Renomme un type d'activité. */
export async function renameType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);

  const id = idSchema.safeParse(raw.id);
  if (!id.success) return { status: "error", message: "Type invalide." };

  const parsed = typeSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error), values: raw };
  if (await isNameTaken(parsed.data.nom, id.data)) {
    return { status: "error", fieldErrors: { nom: ["Ce type existe déjà."] }, values: raw };
  }

  await db.update(typeActivite).set(parsed.data).where(eq(typeActivite.id, id.data));
  revalidatePath("/", "layout");
  return { status: "success", message: "Le type a été renommé." };
}

/** Supprime un type d'activité, uniquement s'il n'est utilisé par aucune activité. */
export async function deleteType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Type invalide." };

  const [usage] = await db.select({ n: count() }).from(activites).where(eq(activites.typeId, id.data));
  if (usage && usage.n > 0) {
    return {
      status: "error",
      message: `Ce type est utilisé par ${usage.n} activité(s) : modifiez-les ou supprimez-les d'abord.`,
    };
  }

  await db.delete(typeActivite).where(eq(typeActivite.id, id.data));
  revalidatePath("/", "layout");
  return { status: "success", message: "Le type a été supprimé." };
}
