import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { ActivityCard } from "@/components/activities/activity-card";
import { ActivityFilters, type Period } from "@/components/activities/activity-filters";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { listActivities, listTypes } from "@/lib/queries/activities";

export const metadata: Metadata = {
  title: "Activités",
  description: "Toutes les activités du Parc Évasion : recherchez par nom, filtrez par type et réservez votre place.",
};

/** Lit un paramètre d'URL qui peut être absent, unique ou répété. */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Liste publique des activités, avec recherche et filtres passés dans l'URL. */
export default async function ActivitiesPage({ searchParams }: PageProps<"/activites">) {
  const params = await searchParams;

  const search = (firstParam(params.q) ?? "").trim().slice(0, 100);
  const typeParam = Number(firstParam(params.type));
  const typeId = Number.isInteger(typeParam) && typeParam > 0 ? typeParam : undefined;
  const periodParam = firstParam(params.periode);
  const period: Period = periodParam === "past" || periodParam === "all" ? periodParam : "upcoming";

  const [types, activities] = await Promise.all([listTypes(), listActivities({ search, typeId, period })]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Programme"
        title="Nos"
        accent="activités"
        description="Trouve l'aventure qui te ressemble et réserve ta place en ligne."
      />

      <ActivityFilters types={types} search={search} typeId={typeId} period={period} />

      <p className="mb-6 text-sm font-bold text-ink-muted" aria-live="polite">
        <span className="mr-1 inline-grid min-w-7 place-items-center rounded-full border-2 border-ink bg-lime px-1.5 text-ink">
          {activities.length}
        </span>
        activité{activities.length > 1 ? "s" : ""} trouvée{activities.length > 1 ? "s" : ""}
        {search && (
          <>
            {" "}
            pour « <strong className="text-ink">{search}</strong> »
          </>
        )}
      </p>

      {activities.length > 0 ? (
        // `key` : les cartes sont ré-animées à chaque nouvelle recherche.
        <Reveal key={`${search}-${typeId}-${period}`} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" rotate={3}>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Reveal>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Aucune activité trouvée"
          description="Essaie avec un autre nom, un autre type d'activité ou une autre période."
          action={
            <LinkButton href="/activites" variant="secondary">
              Réinitialiser la recherche
            </LinkButton>
          }
        />
      )}
    </div>
  );
}
