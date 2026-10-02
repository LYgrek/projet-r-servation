import { ArrowRight, Crosshair, Flower2, Leaf, Mountain, TreePine, Waves } from "lucide-react";
import type { Metadata } from "next";
import { ActivityCard } from "@/components/activities/activity-card";
import { Hero } from "@/components/home/hero";
import { CountUp } from "@/components/motion/count-up";
import { Float } from "@/components/motion/decor";
import { Marquee } from "@/components/motion/marquee";
import { Magnetic } from "@/components/motion/pointer-effects";
import { Reveal } from "@/components/motion/reveal";
import { SplitTitle } from "@/components/motion/split-title";
import { LinkButton } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { formatShortDate, formatTime } from "@/lib/dates";
import { listActivities, listTypes } from "@/lib/queries/activities";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: { absolute: "Parc Évasion — Réservez vos activités en plein air" },
  description:
    "Le Parc Évasion vous accueille pour des activités en pleine nature : accrobranche, escalade, canoë, paintball… Consultez le programme et réservez en ligne.",
};

/** Mots et icônes du bandeau défilant. */
const MARQUEE_ITEMS = [
  { label: "Accrobranche", icon: TreePine },
  { label: "Escalade", icon: Mountain },
  { label: "Canoë & paddle", icon: Waves },
  { label: "Paintball", icon: Crosshair },
  { label: "Yoga", icon: Flower2 },
  { label: "Ateliers nature", icon: Leaf },
];

/** Étapes de réservation présentées sur la page d'accueil. */
const STEPS = [
  { title: "Choisis", text: "Parcours le programme, filtre par type d'activité ou cherche par nom.", color: "bg-lime", rotate: "-rotate-2" },
  { title: "Réserve", text: "Un clic suffit : ta place est garantie immédiatement, confirmation par email.", color: "bg-sun-soft", rotate: "rotate-1" },
  { title: "Profite", text: "Retrouve tes billets dans ton espace et annule gratuitement si besoin.", color: "bg-blush", rotate: "-rotate-1" },
];

/** Page d'accueil : bandeau illustré, chiffres clés, prochaines activités. */
export default async function HomePage() {
  const [user, activities, types] = await Promise.all([
    getCurrentUser(),
    listActivities({ period: "upcoming" }),
    listTypes(),
  ]);
  const nextActivities = activities.slice(0, 3);
  const totalPlaces = activities.reduce((sum, activity) => sum + activity.placesRestantes, 0);
  const first = activities[0];

  return (
    <>
      <Hero
        userName={user?.prenom}
        upcomingCount={activities.length}
        nextActivity={
          first
            ? { id: first.id, nom: first.nom, quand: `${formatShortDate(first.datetimeDebut)} · ${formatTime(first.datetimeDebut)}` }
            : undefined
        }
      />

      {/* ---------- Bandeau défilant ---------- */}
      <div className="relative z-10 -mx-4 -rotate-2 border-y-2 border-ink bg-lime py-4 shadow-hard">
        <Marquee speed={60}>
          {MARQUEE_ITEMS.map(({ label, icon: Icon }) => (
            <span key={label} className="flex items-center gap-4 px-6 text-2xl font-extrabold tracking-tight uppercase md:text-3xl">
              <Icon className="size-7" aria-hidden />
              {label}
              <span className="ml-6 font-serif text-3xl font-normal text-brand-700" aria-hidden>
                ✳
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ---------- Chiffres clés ---------- */}
      <section aria-label="Le parc en chiffres" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <Reveal className="grid gap-5 sm:grid-cols-3">
          {[
            { value: activities.length, label: "activités à venir" },
            { value: totalPlaces, label: "places encore libres" },
            { value: types.length, label: "univers à explorer" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              data-reveal
              className={cn(
                "rounded-[2rem] border-2 border-ink p-7 shadow-hard",
                index === 1 ? "bg-brand-700 text-card" : "bg-card",
              )}
            >
              <CountUp value={stat.value} className="block text-7xl leading-none font-extrabold tracking-tighter tabular-nums" />
              <p className={cn("mt-3 font-serif text-2xl italic", index === 1 ? "text-lime" : "text-ink-muted")}>{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- Prochaines activités ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-extrabold tracking-widest text-sun uppercase">✳ Au programme</p>
            <SplitTitle as="h2" className="text-4xl leading-none font-extrabold tracking-tight md:text-6xl">
              Les prochaines <em className="font-serif font-normal text-brand-700">aventures</em>
            </SplitTitle>
          </div>
          <LinkButton href="/activites" variant="secondary">
            Tout le programme <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
        </div>

        {nextActivities.length > 0 ? (
          <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" rotate={3}>
            {nextActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Reveal>
        ) : (
          <p className="text-ink-muted">Aucune activité n&apos;est programmée pour le moment. Reviens bientôt !</p>
        )}
      </section>

      {/* ---------- Fonctionnement ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <SplitTitle as="h2" className="mb-12 text-4xl leading-none font-extrabold tracking-tight md:text-6xl">
          Comment <em className="font-serif font-normal text-brand-700">ça marche ?</em>
        </SplitTitle>
        <Reveal className="grid gap-6 md:grid-cols-3" rotate={-4} y={70}>
          {STEPS.map((step, index) => (
            <div key={step.title} data-reveal>
              <div className={cn("h-full rounded-[2rem] border-2 border-ink p-7 shadow-hard", step.color, step.rotate)}>
                <span className="text-outline block text-8xl leading-none font-extrabold">{index + 1}</span>
                <h3 className="mt-4 text-2xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-ink-muted">{step.text}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- Appel à l'action ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <Reveal>
          <div
            data-reveal
            className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-800 px-8 py-16 text-center text-card shadow-hard-lg md:py-20"
          >
            <div className="bg-topo absolute inset-0 text-lime" aria-hidden />
            <Float className="absolute top-8 left-[8%] hidden md:block" duration={3.4}>
              <TreePine className="size-16 text-lime" strokeWidth={1.5} />
            </Float>
            <Float className="absolute right-[8%] bottom-8 hidden md:block" duration={2.8} delay={0.6} rotate={-8}>
              <Waves className="size-16 text-blush" strokeWidth={1.5} />
            </Float>
            <div className="relative">
              <h2 className="text-4xl leading-none font-extrabold tracking-tight md:text-6xl">
                Prêt à prendre <em className="font-serif font-normal text-lime">l&apos;air ?</em>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-card/75">
                {totalPlaces} places t&apos;attendent sur les prochaines activités. Annulation gratuite jusqu&apos;au départ.
              </p>
              <Magnetic className="mt-9">
                <LinkButton href={user ? "/activites" : "/inscription"} size="lg" variant="light">
                  {user ? "Réserver une activité" : "Créer mon compte"} <ArrowRight className="size-5" aria-hidden />
                </LinkButton>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
