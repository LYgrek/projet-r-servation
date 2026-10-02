"use server";

/**
 * Server Actions du profil de l'utilisateur connecté :
 * modification des informations, du mot de passe et suppression du compte.
 */
import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { reservations, users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/dal";
import { countAdmins } from "@/lib/queries/users";
import { deleteSession } from "@/lib/session";
import { formDataToObject, passwordChangeSchema, profileSchema, toFieldErrors } from "@/lib/validation";

/** Met à jour le prénom, le nom et l'email de l'utilisateur connecté. */
export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/profil");
  const raw = formDataToObject(formData);

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values: raw };
  }

  // L'email doit rester unique (en excluant l'utilisateur lui-même).
  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, parsed.data.email), ne(users.id, user.id)))
    .limit(1);
  if (taken) {
    return { status: "error", fieldErrors: { email: ["Cette adresse email est déjà utilisée."] }, values: raw };
  }

  await db.update(users).set(parsed.data).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { status: "success", message: "Votre profil a été mis à jour." };
}

/** Change le mot de passe après vérification de l'ancien. */
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/profil");

  const parsed = passwordChangeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };

  const [row] = await db.select({ hash: users.motdepasse }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row || !(await bcrypt.compare(parsed.data.actuel, row.hash))) {
    return { status: "error", fieldErrors: { actuel: ["Le mot de passe actuel est incorrect."] } };
  }

  await db
    .update(users)
    .set({ motdepasse: await bcrypt.hash(parsed.data.nouveau, 10) })
    .where(eq(users.id, user.id));
  return { status: "success", message: "Votre mot de passe a été modifié." };
}

/**
 * Supprime définitivement le compte de l'utilisateur connecté et ses réservations.
 * L'utilisateur doit retaper son email pour confirmer.
 */
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/profil");

  if (String(formData.get("confirmation") ?? "").trim().toLowerCase() !== user.email) {
    return { status: "error", fieldErrors: { confirmation: ["Saisissez votre adresse email pour confirmer."] } };
  }

  // Le parc doit toujours garder au moins un administrateur.
  if (user.role === "admin" && (await countAdmins()) <= 1) {
    return {
      status: "error",
      message: "Vous êtes le dernier administrateur : nommez un autre administrateur avant de supprimer votre compte.",
    };
  }

  // Suppression atomique : les réservations puis l'utilisateur.
  await db.batch([
    db.delete(reservations).where(eq(reservations.userId, user.id)),
    db.delete(users).where(eq(users.id, user.id)),
  ]);

  await deleteSession();
  redirect("/?compte=supprime");
}
