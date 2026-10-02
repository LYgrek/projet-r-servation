"use server";

/**
 * Server Actions d'authentification : inscription, connexion, déconnexion.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { sendWelcomeEmail } from "@/lib/mail";
import { createSession, deleteSession } from "@/lib/session";
import { formDataToObject, loginSchema, signupSchema, toFieldErrors } from "@/lib/validation";

/** Coût du hachage bcrypt (10 = bon compromis sécurité / rapidité). */
const BCRYPT_ROUNDS = 10;

/**
 * N'autorise que les redirections internes (ex. « /activites/3 ») pour éviter
 * les redirections ouvertes vers un site externe (« //evil.com »).
 */
function safeRedirectPath(value: string | undefined): Route {
  return (value && value.startsWith("/") && !value.startsWith("//") ? value : "/activites") as Route;
}

/** Inscription d'un nouvel utilisateur (rôle « user » par défaut). */
export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  // On ne renvoie jamais les mots de passe au client.
  const values = { prenom: raw.prenom ?? "", nom: raw.nom ?? "", email: raw.email ?? "" };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { prenom, nom, email, motdepasse } = parsed.data;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { status: "error", fieldErrors: { email: ["Un compte existe déjà avec cette adresse email."] }, values };
  }

  const hash = await bcrypt.hash(motdepasse, BCRYPT_ROUNDS);
  const [user] = await db
    .insert(users)
    .values({ prenom, nom, email, motdepasse: hash, role: "user" })
    .returning({ id: users.id, role: users.role });

  if (!user) return { status: "error", message: "Impossible de créer le compte, réessayez.", values };

  await createSession(user.id, user.role);
  void sendWelcomeEmail({ email, prenom });

  redirect(safeRedirectPath(raw.redirect));
}

/** Connexion par email et mot de passe. */
export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const values = { email: raw.email ?? "" };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);

  // Même message que l'email soit inconnu ou le mot de passe faux :
  // on ne révèle pas quels emails possèdent un compte.
  const valid = user ? await bcrypt.compare(parsed.data.motdepasse, user.motdepasse) : false;
  if (!user || !valid) {
    return { status: "error", message: "Email ou mot de passe incorrect.", values };
  }

  await createSession(user.id, user.role);
  redirect(safeRedirectPath(raw.redirect));
}

/** Déconnexion : suppression du cookie de session. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
