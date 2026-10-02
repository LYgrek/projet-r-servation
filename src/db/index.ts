/**
 * Connexion unique à la base de données.
 *
 * En développement, Next.js recharge les modules à chaud : on conserve le
 * client sur `globalThis` pour éviter d'ouvrir une nouvelle connexion à
 * chaque modification de fichier.
 */
import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { libsqlClient?: Client };

const client =
  globalForDb.libsqlClient ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:data/parc.db",
    // Requis pour une base distante (Turso), ignoré pour un fichier local.
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") globalForDb.libsqlClient = client;

/** Instance Drizzle typée avec le schéma complet. */
export const db = drizzle(client, { schema });
