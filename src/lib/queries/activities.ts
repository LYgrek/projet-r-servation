/**
 * Requêtes de lecture sur les activités et leurs types.
 */
import "server-only";
import { and, asc, count, desc, eq, getTableColumns, gte, lt, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { activites, reservations, typeActivite, type Activite, type TypeActivite } from "@/db/schema";

/** Activité enrichie avec son type et son taux de remplissage. */
export interface ActivityWithDetails extends Activite {
  typeNom: string;
  /** Nombre de réservations actives (non annulées). */
  placesReservees: number;
  /** Nombre de places encore disponibles (jamais négatif). */
  placesRestantes: number;
}

/** Filtres disponibles sur la liste des activités. */
export interface ActivityFilters {
  /** Recherche (insensible à la casse et aux accents) sur le nom de l'activité. */
  search?: string;
  /** Filtre sur un type d'activité. */
  typeId?: number;
  /** `upcoming` (par défaut), `past` ou `all`. */
  period?: "upcoming" | "past" | "all";
}

/** Normalise un texte pour une comparaison insensible à la casse et aux accents. */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
}

/** Nombre de réservations actives, calculé via une jointure externe. */
const reservedCount = sql<number>`count(${reservations.id})`.mapWith(Number);

/** Ajoute les champs calculés à une ligne brute. */
function withRemaining<T extends Activite & { typeNom: string; placesReservees: number }>(
  row: T,
): T & { placesRestantes: number } {
  return { ...row, placesRestantes: Math.max(0, row.placesDisponibles - row.placesReservees) };
}

/** Requête de base : activités + type + nombre de réservations actives. */
function baseActivityQuery() {
  return db
    .select({ ...getTableColumns(activites), typeNom: typeActivite.nom, placesReservees: reservedCount })
    .from(activites)
    .innerJoin(typeActivite, eq(activites.typeId, typeActivite.id))
    .leftJoin(reservations, and(eq(reservations.activiteId, activites.id), eq(reservations.etat, true)))
    .groupBy(activites.id);
}

/** Liste des activités, filtrée et triée par date de début. */
export async function listActivities(filters: ActivityFilters = {}): Promise<ActivityWithDetails[]> {
  const conditions: SQL[] = [];
  const now = new Date();

  if (filters.typeId) conditions.push(eq(activites.typeId, filters.typeId));
  if ((filters.period ?? "upcoming") === "upcoming") conditions.push(gte(activites.datetimeDebut, now));
  if (filters.period === "past") conditions.push(lt(activites.datetimeDebut, now));

  const rows = await baseActivityQuery()
    .where(and(...conditions))
    .orderBy(filters.period === "past" ? desc(activites.datetimeDebut) : asc(activites.datetimeDebut));

  // La recherche par nom est faite ici plutôt qu'avec LIKE : SQLite ne sait
  // pas ignorer les accents (« canoe » doit trouver « Canoë »).
  const search = filters.search ? normalize(filters.search) : "";
  return rows.filter((row) => !search || normalize(row.nom).includes(search)).map(withRemaining);
}

/** Détail d'une activité, ou `null` si elle n'existe pas. */
export async function getActivity(id: number): Promise<ActivityWithDetails | null> {
  const [row] = await baseActivityQuery().where(eq(activites.id, id)).limit(1);
  return row ? withRemaining(row) : null;
}

/** Tous les types d'activité, triés par nom. */
export async function listTypes(): Promise<TypeActivite[]> {
  return db.select().from(typeActivite).orderBy(asc(typeActivite.nom));
}

/** Types d'activité avec le nombre d'activités associées (page d'administration). */
export async function listTypesWithCount(): Promise<(TypeActivite & { nbActivites: number })[]> {
  return db
    .select({ ...getTableColumns(typeActivite), nbActivites: count(activites.id) })
    .from(typeActivite)
    .leftJoin(activites, eq(activites.typeId, typeActivite.id))
    .groupBy(typeActivite.id)
    .orderBy(asc(typeActivite.nom));
}
