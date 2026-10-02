import { CalendarX2, Clock, Hourglass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { CancelReservationButton } from "@/components/reservations/cancel-reservation-button";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { requireUser } from "@/lib/dal";
import { formatDateTime, formatDuration, formatTime, PARK_TIMEZONE } from "@/lib/dates";
import { listUserReservations, type ReservationWithActivity } from "@/lib/queries/reservations";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Consultez et gérez vos réservations d'activités au Parc Évasion.",
};

const dayFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, day: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, month: "short" });
const weekdayFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: PARK_TIMEZONE, weekday: "short" });

/** Page listant les réservations de l'utilisateur connecté, classées par statut. */
export default async function ReservationsPage() {
  const user = await requireUser("/reservations");
  const reservations = await listUserReservations(user.id);
  const now = new Date();

  const upcoming = reservations
    .filter((r) => r.etat && r.activite.datetimeDebut > now)
    .sort((a, b) => a.activite.datetimeDebut.getTime() - b.activite.datetimeDebut.getTime());
  const past = reservations.filter((r) => r.etat && r.activite.datetimeDebut <= now);
  const cancelled = reservations.filter((r) => !r.etat);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Mon carnet"
        title="Mes"
        accent="billets"
        description={`${upcoming.length} aventure${upcoming.length > 1 ? "s" : ""} à venir. Bon vent, ${user.prenom} !`}
        actions={<LinkButton href="/activites">Réserver une activité</LinkButton>}
      />

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Aucun billet pour le moment"
          description="Parcours notre programme et réserve ta première activité !"
          action={<LinkButton href="/activites">Découvrir les activités</LinkButton>}
        />
      ) : (
        <Reveal className="space-y-14" rotate={-2}>
          <ReservationSection title="À venir" reservations={upcoming} cancellable emptyText="Aucune activité à venir." />
          {past.length > 0 && <ReservationSection title="Souvenirs" reservations={past} />}
          {cancelled.length > 0 && <ReservationSection title="Annulées" reservations={cancelled} />}
        </Reveal>
      )}
    </div>
  );
}

/** Section regroupant des réservations d'un même statut. */
function ReservationSection({
  title,
  reservations,
  cancellable = false,
  emptyText,
}: {
  title: string;
  reservations: ReservationWithActivity[];
  cancellable?: boolean;
  emptyText?: string;
}) {
  const headingId = `section-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-5 flex items-center gap-3 font-serif text-3xl italic">
        {title}
        <span className="rounded-full border-2 border-ink bg-card px-2.5 font-sans text-sm font-extrabold not-italic">
          {reservations.length}
        </span>
        <span className="h-0.5 flex-1 border-t-2 border-dashed border-ink/25" aria-hidden />
      </h2>
      {reservations.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-ink/30 px-5 py-8 text-center text-ink-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-5">
          {reservations.map((reservation) => (
            <TicketRow key={reservation.id} reservation={reservation} cancellable={cancellable} />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Une réservation présentée comme un billet : talon daté à gauche, ligne
 * perforée, puis les informations et l'action d'annulation.
 */
function TicketRow({ reservation, cancellable }: { reservation: ReservationWithActivity; cancellable: boolean }) {
  const { activite } = reservation;
  const isPast = activite.datetimeDebut <= new Date();
  const status = !reservation.etat ? "cancelled" : isPast ? "past" : "upcoming";

  return (
    <li data-reveal>
      <article
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card shadow-hard sm:flex-row",
          status !== "upcoming" && "opacity-80",
        )}
      >
        {/* Talon */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-3 px-6 py-4 sm:w-36 sm:flex-col sm:justify-center sm:gap-0 sm:py-6",
            status === "upcoming" && "bg-lime",
            status === "past" && "bg-paper-deep",
            status === "cancelled" && "bg-sun-soft",
          )}
        >
          <span className="text-xs font-extrabold tracking-widest uppercase">{weekdayFormat.format(activite.datetimeDebut)}</span>
          <span className="text-5xl leading-none font-extrabold tracking-tighter">{dayFormat.format(activite.datetimeDebut)}</span>
          <span className="font-serif text-xl italic">{monthFormat.format(activite.datetimeDebut)}</span>
        </div>

        {/* Perforation : verticale sur grand écran, horizontale sur mobile */}
        <div className="relative border-t-2 border-dashed border-ink sm:border-t-0 sm:border-l-2" aria-hidden>
          <span className="absolute -top-3.5 -left-3.5 hidden size-7 rounded-full border-2 border-ink bg-paper sm:block" />
          <span className="absolute -bottom-3.5 -left-3.5 hidden size-7 rounded-full border-2 border-ink bg-paper sm:block" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold tracking-[0.25em] text-ink-subtle uppercase">
              Billet N°{String(reservation.id).padStart(5, "0")} · {activite.typeNom}
            </p>
            <Link
              href={`/activites/${activite.id}`}
              className={cn(
                "mt-1 block text-xl leading-tight font-extrabold hover:text-brand-700",
                status === "cancelled" && "line-through decoration-sun decoration-2",
              )}
            >
              {activite.nom}
            </Link>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden /> {formatTime(activite.datetimeDebut)}
              </span>
              <span className="flex items-center gap-1.5">
                <Hourglass className="size-4" aria-hidden /> {formatDuration(activite.duree)}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-subtle">Réservé le {formatDateTime(reservation.dateReservation)}</p>
          </div>

          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <span
              className={cn(
                "rotate-[-6deg] rounded-md border-2 px-2.5 py-0.5 text-xs font-extrabold tracking-widest uppercase",
                status === "upcoming" && "border-brand-700 text-brand-700",
                status === "past" && "border-ink-subtle text-ink-subtle",
                status === "cancelled" && "border-red-700 text-red-700",
              )}
            >
              {status === "upcoming" ? "Confirmé" : status === "past" ? "Composté" : "Annulé"}
            </span>
            {cancellable && status === "upcoming" && (
              <CancelReservationButton reservationId={reservation.id} activityName={activite.nom} />
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
