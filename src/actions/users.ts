"use server";

/**
 * Server Actions d'administration des utilisateurs (bonus) : changement de rôle.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { ROLES, users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/dal";
import { idSchema } from "@/lib/validation";

const roleChangeSchema = z.object({ id: idSchema, role: z.enum(ROLES) });

/** Change le rôle d'un utilisateur (un administrateur ne peut pas se rétrograder lui-même). */
export async function changeUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = roleChangeSchema.safeParse({ id: formData.get("id"), role: formData.get("role") });
  if (!parsed.success) return { status: "error", message: "Données invalides." };

  if (parsed.data.id === admin.id) {
    return { status: "error", message: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  const [updated] = await db
    .update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, parsed.data.id))
    .returning({ prenom: users.prenom, nom: users.nom });
  if (!updated) return { status: "error", message: "Utilisateur introuvable." };

  revalidatePath("/admin/utilisateurs");
  return {
    status: "success",
    message: `${updated.prenom} ${updated.nom} est maintenant ${parsed.data.role === "admin" ? "administrateur" : "utilisateur"}.`,
  };
}
