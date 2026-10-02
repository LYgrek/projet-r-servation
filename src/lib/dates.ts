/**
 * Utilitaires de dates.
 *
 * Toutes les dates sont affichées et saisies dans le fuseau du parc
 * (Europe/Paris), quel que soit le fuseau du serveur ou du navigateur.
 * Cela évite les décalages d'horaires entre le rendu serveur et le client.
 */

export const PARK_TIMEZONE = "Europe/Paris";
const LOCALE = "fr-FR";

/** Ex. : « samedi 4 octobre 2026 ». */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: PARK_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Ex. : « sam. 4 oct. ». */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: PARK_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Ex. : « 14:30 ». */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: PARK_TIMEZONE, hour: "2-digit", minute: "2-digit" }).format(date);
}

/** Ex. : « 04/10/2026 à 14:30 ». */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: PARK_TIMEZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/** Convertit une durée en minutes en texte lisible. Ex. : 150 -> « 2 h 30 ». */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** Retourne la date de fin d'une activité à partir de son début et de sa durée. */
export function getEndDate(start: Date, durationMinutes: number): Date {
  return new Date(start.getTime() + durationMinutes * 60_000);
}

/** Décompose une date en ses composantes dans le fuseau du parc. */
function getParkParts(date: Date): Record<"year" | "month" | "day" | "hour" | "minute" | "second", number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARK_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Décalage (en minutes) entre le fuseau du parc et UTC à un instant donné. */
function getParkOffsetMinutes(date: Date): number {
  const p = getParkParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/**
 * Convertit la valeur d'un `<input type="datetime-local">` (« 2026-10-04T14:30 »),
 * interprétée dans le fuseau du parc, en objet `Date`. Retourne `null` si invalide.
 */
export function parseParkDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
  const naiveUtc = Date.UTC(y, mo - 1, d, h, mi);

  // Deux passes pour gérer correctement les changements d'heure été/hiver.
  let result = new Date(naiveUtc - getParkOffsetMinutes(new Date(naiveUtc)) * 60_000);
  result = new Date(naiveUtc - getParkOffsetMinutes(result) * 60_000);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** Convertit une `Date` en valeur pour un `<input type="datetime-local">` (fuseau du parc). */
export function toParkDateTimeInput(date: Date): string {
  const p = getParkParts(date);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Valeur `datetime-local` pour demain à l'heure indiquée (fuseau du parc). */
export function tomorrowAtParkHourInput(hour: number): string {
  const tomorrowDay = toParkDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)).slice(0, 10);
  const date = parseParkDateTime(`${tomorrowDay}T${String(hour).padStart(2, "0")}:00`);
  return date ? toParkDateTimeInput(date) : `${tomorrowDay}T10:00`;
}
