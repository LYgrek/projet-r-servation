/**
 * Couche d'accès aux données d'authentification (Data Access Layer).
 *
 * C'est ICI que se font les vraies vérifications d'autorisation : le proxy
 * ne fait qu'une redirection « optimiste ». Chaque page et chaque Server
 * Action sensible appelle `requireUser()` ou `requireAdmin()`.
 *
 * L'utilisateur est relu en base à chaque requête : un compte supprimé ou
 * un rôle modifié est donc pris en compte immédiatement.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { users, type PublicUser } from "@/db/schema";
import { readSession } from "./session";

/**
 * Retourne l'utilisateur connecté (sans mot de passe), ou `null`.
 * `cache` évite de refaire la requête plusieurs fois pendant un même rendu.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const [user] = await db
    .select({ id: users.id, prenom: users.prenom, nom: users.nom, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
});

/** Exige un utilisateur connecté ; redirige vers la page de connexion sinon. */
export async function requireUser(redirectTo?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo ? `/connexion?redirect=${encodeURIComponent(redirectTo)}` : "/connexion");
  }
  return user;
}

/**
 * Exige un administrateur. Un visiteur non connecté est envoyé vers la
 * connexion ; un utilisateur simple est renvoyé à l'accueil avec un message.
 */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/?erreur=acces-refuse");
  return user;
}
