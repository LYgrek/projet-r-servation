import { ArrowUpRight, Clock, Hourglass } from "lucide-react";
import Link from "next/link";
import { Tilt } from "@/components/motion/pointer-effects";
import { PARK_TIMEZONE, formatDuration, formatTime } from "@/lib/dates";
import type { ActivityWithDetails } from "@/lib/queries/activities";
import { getAvailability, PlacesIndicator } from "./places-indicator";
import { TypeBanner } from "./type-visual";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, day: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, month: "short" });
const weekdayFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, weekday: "long" });

/**
 * Carte d'une activité, dessinée comme un billet : bandeau coloré avec un
 * tampon de date, ligne perforée, puis les informations pratiques.
 * Doit être placée dans un `<Reveal>` (attribut `data-reveal`).
 */
export function ActivityCard({ activity }: { activity: ActivityWithDetails }) {
  const isPast = activity.datetimeDebut < new Date();
  const availability = getAvailability(activity.placesRestantes, activity.placesDisponibles);

  return (
    <div data-reveal className="h-full">
      <Tilt className="h-full">
        <Link
          href={`/activites/${activity.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-ink bg-card shadow-hard transition-shadow duration-300 hover:shadow-hard-lg"
        >
          <TypeBanner typeNom={activity.typeNom} typeId={activity.typeId} className="h-40">
            <span className="absolute top-4 left-4 rounded-full border-2 border-ink bg-card px-3 py-0.5 text-[11px] font-extrabold tracking-wider text-ink uppercase">
              {activity.typeNom}
            </span>

            {/* Tampon de date */}
            <span className="absolute top-3 right-4 flex size-[4.5rem] rotate-6 flex-col items-center justify-center rounded-full border-2 border-dashed border-ink bg-card text-ink transition-transform duration-500 group-hover:rotate-[-8deg]">
              <span className="text-2xl leading-none font-extrabold">{dayFormat.format(activity.datetimeDebut)}</span>
              <span className="text-[11px] font-bold uppercase">{monthFormat.format(activity.datetimeDebut)}</span>
            </span>

            {(isPast || availability === "full") && (
              <span className="absolute bottom-4 left-4 -rotate-6 rounded-md border-2 border-ink bg-sun px-2.5 py-0.5 text-sm font-extrabold tracking-widest text-ink uppercase">
                {isPast ? "Terminée" : "Complet"}
              </span>
            )}
          </TypeBanner>

          {/* Ligne perforée avec deux encoches, comme un ticket détachable */}
          <div className="relative border-t-2 border-ink">
            <span className="absolute -top-3 -left-3 size-6 rounded-full border-2 border-ink bg-paper" aria-hidden />
            <span className="absolute -top-3 -right-3 size-6 rounded-full border-2 border-ink bg-paper" aria-hidden />
          </div>

          <div className="flex flex-1 flex-col p-5 pt-6">
            <p className="text-xs font-bold text-ink-subtle capitalize">{weekdayFormat.format(activity.datetimeDebut)}</p>
            <h2 className="mt-0.5 text-xl leading-tight font-extrabold text-balance">{activity.nom}</h2>

            <p className="mt-3 mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden /> {formatTime(activity.datetimeDebut)}
              </span>
              <span className="flex items-center gap-1.5">
                <Hourglass className="size-4" aria-hidden /> {formatDuration(activity.duree)}
              </span>
            </p>

            <div className="mt-auto flex items-end gap-4 border-t-2 border-dashed border-ink/20 pt-4">
              <PlacesIndicator
                restantes={activity.placesRestantes}
                total={activity.placesDisponibles}
                className="flex-1"
              />
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-lime transition-transform duration-300 group-hover:rotate-45"
                aria-hidden
              >
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </div>
        </Link>
      </Tilt>
    </div>
  );
}
