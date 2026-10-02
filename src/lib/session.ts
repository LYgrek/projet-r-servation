/**
 * Gestion des sessions par cookie signé (JWT HS256 via `jose`).
 *
 * Le cookie ne contient que l'identifiant et le rôle de l'utilisateur.
 * Il est `httpOnly` (inaccessible au JavaScript du navigateur), `sameSite=lax`
 * et `secure` en production.
 *
 * Ce module ne dépend pas de la base de données : il peut donc être utilisé
 * par le proxy (`src/proxy.ts`) pour une vérification rapide des accès.
 */
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/db/schema";

export const SESSION_COOKIE = "parc_session";

/** Durée de validité d'une session : 7 jours. */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Contenu de la session stockée dans le cookie. */
export interface SessionPayload extends JWTPayload {
  userId: number;
  role: Role;
}

/** Récupère la clé de signature à partir de la variable d'environnement. */
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET doit être défini (32 caractères minimum).");
    }
    // Secret de secours pour faciliter le développement local uniquement.
    return new TextEncoder().encode("dev-secret-a-ne-jamais-utiliser-en-production-0123456789");
  }
  return new TextEncoder().encode(secret);
}

/** Signe un payload de session et retourne le JWT. */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION_MS))
    .sign(getSecretKey());
}

/** Vérifie un JWT et retourne son payload, ou `null` s'il est invalide ou expiré. */
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number" || (payload.role !== "user" && payload.role !== "admin")) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Crée (ou remplace) le cookie de session de l'utilisateur. */
export async function createSession(userId: number, role: Role): Promise<void> {
  const token = await encrypt({ userId, role });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

/** Lit et vérifie la session courante à partir des cookies. */
export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Supprime le cookie de session (déconnexion). */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
