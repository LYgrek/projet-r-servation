import { CalendarRange, Gauge, Plus, Ticket, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlacesIndicator } from "@/components/activities/places-indicator";
import { CountUp } from "@/components/motion/count-up";
import { AnimatedBar } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Badge, Card, IconSticker, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/dal";
import { formatDateTime, formatShortDate } from "@/lib/dates";
import { listActivities } from "@/lib/queries/activities";
import { listAllReservations } from "@/lib/queries/reservations";
import { getDashboardStats } from "@/lib/queries/stats";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Statistiques du parc : utilisateurs, activités, réservations et taux de remplissage.",
};

const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });

/** Tableau de bord administrateur avec les indicateurs clés (bonus). */
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [stats, upcoming, recent] = await Promise.all([
    getDashboardStats(),
    listActivities({ period: "upcoming" }),
    listAllReservations(6),
  ]);

  // Activités à venir les plus remplies.
  const topActivities = [...upcoming]
    .sort((a, b) => b.placesReservees / b.placesDisponibles - a.placesReservees / a.placesDisponibles)
    .slice(0, 5);
  const maxByType = Math.max(1, ...stats.parType.map((t) => t.reservations));

  return (
    <>
      <PageHeader
        eyebrow={`Salut ${admin.prenom}`}
        title="Tableau de"
        accent="bord"
        description="Vue d'ensemble de l'activité du parc."
        actions={
          <LinkButton href="/admin/activites/nouvelle" variant="accent">
            <Plus className="size-4" aria-hidden /> Nouvelle activité
          </LinkButton>
        }
      />

      <Reveal className="space-y-6">
        {/* ---------- Indicateurs clés ---------- */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile icon={Users} label="Utilisateurs" detail={`dont ${stats.nbAdmins} administrateur(s)`} color="bg-card">
            <CountUp value={stats.nbUtilisateurs} />
          </StatTile>
          <StatTile icon={CalendarRange} label="Activités à venir" detail={`${stats.nbActivitesTotal} au total`} color="bg-lime">
            <CountUp value={stats.nbActivitesAVenir} />
          </StatTile>
          <StatTile
            icon={Ticket}
            label="Réservations actives"
            detail={`${stats.nbReservationsAnnulees} annulée(s) · ${percent.format(stats.tauxAnnulation)} d'annulation`}
            color="bg-sun-soft"
          >
            <CountUp value={stats.nbReservationsActives} />
          </StatTile>
          <StatTile icon={Gauge} label="Remplissage" detail="des places des activités à venir" color="bg-blush">
            <CountUp value={stats.tauxRemplissage} format="percent" />
          </StatTile>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* ---------- Réservations par type ---------- */}
          <div data-reveal>
            <Card className="h-full p-7">
              <h2 className="text-xl font-extrabold">Réservations actives par type</h2>
              <p className="mb-6 text-sm text-ink-subtle">Toutes périodes confondues</p>
              <ul className="space-y-4">
                {stats.parType.map((type) => (
                  <li key={type.typeNom} className="grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-3 text-sm">
                    <span className="truncate font-bold" title={type.typeNom}>
                      {type.typeNom}
                    </span>
                    <div title={`${type.typeNom} : ${type.reservations} réservation(s)`}>
                      <AnimatedBar
                        value={type.reservations / maxByType}
                        className="h-4 rounded-full border-2 border-ink bg-paper p-px"
                        barClassName="bg-brand-500"
                      />
                    </div>
                    <span className="text-right font-extrabold tabular-nums">{type.reservations}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* ---------- Activités les plus demandées ---------- */}
          <div data-reveal>
            <Card className="h-full p-7">
              <h2 className="text-xl font-extrabold">Activités les plus demandées</h2>
              <p className="mb-6 text-sm text-ink-subtle">Activités à venir, par taux de remplissage</p>
              {topActivities.length === 0 ? (
                <p className="text-sm text-ink-muted">Aucune activité à venir.</p>
              ) : (
                <ul className="space-y-5">
                  {topActivities.map((activity) => (
                    <li key={activity.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                        <Link href={`/activites/${activity.id}`} className="truncate font-bold hover:text-brand-700">
                          {activity.nom}
                        </Link>
                        <span className="shrink-0 font-serif text-base text-ink-subtle capitalize italic">
                          {formatShortDate(activity.datetimeDebut)}
                        </span>
                      </div>
                      <PlacesIndicator restantes={activity.placesRestantes} total={activity.placesDisponibles} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>

        {/* ---------- Dernières réservations ---------- */}
        <div data-reveal>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-ink bg-paper-deep px-6 py-4">
              <h2 className="text-xl font-extrabold">Dernières réservations</h2>
              <Link href="/admin/reservations" className="text-sm font-bold underline decoration-2 underline-offset-2 hover:text-sun">
                Tout voir
              </Link>
            </div>
            <ul className="divide-y-2 divide-dashed divide-ink/10">
              {recent.map((reservation) => (
                <li key={reservation.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3.5 text-sm">
                  <span className="font-extrabold">
                    {reservation.user.prenom} {reservation.user.nom}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-muted">{reservation.activite.nom}</span>
                  <span className="text-xs text-ink-subtle">{formatDateTime(reservation.dateReservation)}</span>
                  {reservation.etat ? <Badge tone="lime">Active</Badge> : <Badge tone="red">Annulée</Badge>}
                </li>
              ))}
              {recent.length === 0 && <li className="px-6 py-6 text-sm text-ink-muted">Aucune réservation.</li>}
            </ul>
          </Card>
        </div>
      </Reveal>
    </>
  );
}

/** Tuile d'indicateur clé avec un grand nombre animé. */
function StatTile({
  icon,
  label,
  detail,
  color,
  children,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div data-reveal>
      <Card className={cn("h-full p-6", color)}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-extrabold tracking-wide uppercase">{label}</p>
          <IconSticker icon={icon} className="size-10 bg-card" />
        </div>
        <p className="mt-4 text-5xl leading-none font-extrabold tracking-tighter tabular-nums">{children}</p>
        <p className="mt-2 text-xs font-semibold text-ink-muted">{detail}</p>
      </Card>
    </div>
  );
}
