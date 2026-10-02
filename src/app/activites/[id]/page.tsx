import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Hourglass, LogIn, Pencil, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailability, PlacesIndicator } from "@/components/activities/places-indicator";
import { ReserveButton } from "@/components/activities/reserve-button";
import { TypeBanner } from "@/components/activities/type-visual";
import { LinkButton } from "@/components/ui/button";
import { Intro } from "@/components/motion/intro";
import { SplitTitle } from "@/components/motion/split-title";
import { Badge } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/dal";
import { formatDate, formatDuration, formatShortDate, formatTime, getEndDate } from "@/lib/dates";
import { getActivity } from "@/lib/queries/activities";
import { findActiveReservation } from "@/lib/queries/reservations";
import { idSchema } from "@/lib/validation";

/** Charge l'activité depuis le paramètre d'URL, ou affiche la page 404. */
async function loadActivity(rawId: string) {
  const id = idSchema.safeParse(rawId);
  if (!id.success) notFound();
  const activity = await getActivity(id.data);
  if (!activity) notFound();
  return activity;
}

/** Métadonnées dynamiques : titre et description propres à l'activité. */
export async function generateMetadata({ params }: PageProps<"/activites/[id]">): Promise<Metadata> {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  const activity = parsed.success ? await getActivity(parsed.data) : null;
  if (!activity) return { title: "Activité introuvable" };

  const description = `${activity.typeNom} · ${formatDate(activity.datetimeDebut)} à ${formatTime(activity.datetimeDebut)}. ${activity.description}`;
  return {
    title: activity.nom,
    description: description.slice(0, 160),
    openGraph: { title: activity.nom, description: description.slice(0, 160), type: "website" },
  };
}

/** Page de détail d'une activité avec le module de réservation. */
export default async function ActivityPage({ params }: PageProps<"/activites/[id]">) {
  const { id } = await params;
  const activity = await loadActivity(id);
  const user = await getCurrentUser();
  const existingReservation = user ? await findActiveReservation(user.id, activity.id) : null;

  const isPast = activity.datetimeDebut <= new Date();
  const availability = getAvailability(activity.placesRestantes, activity.placesDisponibles);
  const end = getEndDate(activity.datetimeDebut, activity.duree);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/activites"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-1.5 text-sm font-bold transition hover:bg-lime"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> Toutes les activités
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* ---------- Informations ---------- */}
        <Intro className="min-w-0">
          <div data-intro className="group">
            <TypeBanner
              typeNom={activity.typeNom}
              typeId={activity.typeId}
              className="h-56 rounded-[2.5rem] border-2 border-ink shadow-hard md:h-72"
              iconClassName="size-52"
            >
              <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                <Badge className="bg-card">{activity.typeNom}</Badge>
                {isPast && <Badge>Terminée</Badge>}
                {!isPast && availability === "full" && <Badge tone="red">Complet</Badge>}
                {!isPast && availability === "low" && <Badge tone="amber">Dernières places</Badge>}
              </div>
              <span className="absolute bottom-5 left-5 rotate-[-4deg] rounded-xl border-2 border-ink bg-card px-4 py-2 text-ink">
                <span className="block text-[11px] font-extrabold tracking-widest text-sun uppercase">Rendez-vous</span>
                <span className="block font-serif text-2xl leading-tight capitalize italic">{formatDate(activity.datetimeDebut)}</span>
              </span>
            </TypeBanner>
          </div>

          <SplitTitle className="mt-10 text-4xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-6xl">
            {activity.nom}
          </SplitTitle>

          <dl data-intro className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoItem icon={CalendarDays} label="Date" color="bg-lime" rotate="-rotate-1">
              <span className="capitalize">{formatShortDate(activity.datetimeDebut)}</span>
            </InfoItem>
            <InfoItem icon={Clock} label="Horaires" color="bg-sun-soft" rotate="rotate-1">
              {formatTime(activity.datetimeDebut)} – {formatTime(end)}
            </InfoItem>
            <InfoItem icon={Hourglass} label="Durée" color="bg-blush" rotate="-rotate-1">
              {formatDuration(activity.duree)}
            </InfoItem>
          </dl>

          {/* Description présentée comme une page de carnet ligné */}
          <section
            data-intro
            className="mt-10 rounded-[2rem] border-2 border-ink bg-card p-7 shadow-hard md:p-9"
          >
            <h2 className="mb-2 font-serif text-3xl italic">Au programme</h2>
            {/* Lignes de cahier : une ligne tous les 32px, alignée sur la hauteur de ligne du texte. */}
            <p className="bg-[repeating-linear-gradient(transparent_0_31px,var(--color-line)_31px_32px)] text-lg leading-8 whitespace-pre-line text-ink-muted">
              {activity.description}
            </p>
          </section>
        </Intro>

        {/* ---------- Module de réservation : un billet ---------- */}
        <aside aria-label="Réservation">
          <Intro delay={0.5} className="lg:sticky lg:top-28">
            <div data-intro className="overflow-hidden rounded-[2rem] border-2 border-ink bg-card shadow-hard-lg">
              <div className="bg-dots bg-ink px-6 py-5 text-lime">
                <p className="text-[11px] font-extrabold tracking-[0.3em] uppercase">Billet d&apos;entrée</p>
                <p className="mt-1 font-serif text-3xl text-card italic">N°{String(activity.id).padStart(4, "0")}</p>
              </div>
              <div className="relative border-t-2 border-dashed border-ink">
                <span className="absolute -top-3.5 -left-3.5 size-7 rounded-full border-2 border-ink bg-paper" aria-hidden />
                <span className="absolute -top-3.5 -right-3.5 size-7 rounded-full border-2 border-ink bg-paper" aria-hidden />
              </div>
              <div className="p-6">
                <div className="mb-5 flex items-center gap-2 text-sm font-bold text-ink-muted">
                  <Users className="size-4" aria-hidden /> Capacité : {activity.placesDisponibles} participants
                </div>
                <PlacesIndicator restantes={activity.placesRestantes} total={activity.placesDisponibles} className="mb-7" />

                <BookingPanel
                  activityId={activity.id}
                  isPast={isPast}
                  isFull={availability === "full"}
                  isLoggedIn={Boolean(user)}
                  alreadyBooked={Boolean(existingReservation)}
                />

                {user?.role === "admin" && (
                  <LinkButton
                    href={`/admin/activites/${activity.id}/modifier`}
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Pencil className="size-4" aria-hidden /> Modifier l&apos;activité
                  </LinkButton>
                )}
              </div>
            </div>
          </Intro>
        </aside>
      </div>
    </div>
  );
}

/** Élément d'information façon post-it (icône + libellé + valeur). */
function InfoItem({
  icon: Icon,
  label,
  color,
  rotate,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  color: string;
  rotate: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex gap-3 rounded-2xl border-2 border-ink p-4 shadow-hard-sm ${color} ${rotate}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <dt className="text-[11px] font-extrabold tracking-widest uppercase opacity-70">{label}</dt>
        <dd className="mt-0.5 font-extrabold">{children}</dd>
      </div>
    </div>
  );
}

/** Choisit l'action de réservation à afficher selon la situation. */
function BookingPanel({
  activityId,
  isPast,
  isFull,
  isLoggedIn,
  alreadyBooked,
}: {
  activityId: number;
  isPast: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  alreadyBooked: boolean;
}) {
  if (alreadyBooked) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-lime px-4 py-3 text-sm font-bold">
          <CheckCircle2 className="size-5" aria-hidden /> Tu participes à cette activité !
        </p>
        <LinkButton href="/reservations" variant="secondary" className="w-full">
          Gérer mes réservations
        </LinkButton>
      </div>
    );
  }

  if (isPast) {
    return <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-3 text-center text-sm font-bold text-ink-muted">Cette activité est terminée.</p>;
  }

  if (isFull) {
    return (
      <p className="rounded-2xl border-2 border-ink bg-sun-soft px-4 py-3 text-center text-sm font-bold text-red-900">
        Cette activité est complète. Reviens plus tard : des places peuvent se libérer.
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-2 text-center">
        <LinkButton href={`/connexion?redirect=/activites/${activityId}`} size="lg" className="w-full">
          <LogIn className="size-5" aria-hidden /> Se connecter pour réserver
        </LinkButton>
        <p className="pt-1 text-xs text-ink-subtle">
          Pas encore de compte ?{" "}
          <Link href={`/inscription?redirect=/activites/${activityId}`} className="font-bold text-brand-700 underline decoration-2 underline-offset-2 hover:text-sun">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    );
  }

  return <ReserveButton activityId={activityId} />;
}
