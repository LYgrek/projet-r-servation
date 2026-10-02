import { CalendarPlus, Eye, Pencil } from "lucide-react";
import type { Metadata } from "next";
import { DeleteActivityButton } from "@/components/admin/delete-activity-button";
import { LinkButton } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { formatDateTime, formatDuration } from "@/lib/dates";
import { listActivities } from "@/lib/queries/activities";

export const metadata: Metadata = {
  title: "Gestion des activités",
  description: "Créer, modifier et supprimer les activités du parc.",
};

/** Liste des activités pour l'administration (à venir puis passées). */
export default async function AdminActivitiesPage() {
  await requireAdmin();
  const [upcoming, past] = await Promise.all([listActivities({ period: "upcoming" }), listActivities({ period: "past" })]);
  const activities = [...upcoming, ...past];
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Activités"
        description={`${upcoming.length} à venir · ${past.length} passée(s)`}
        actions={
          <LinkButton href="/admin/activites/nouvelle">
            <CalendarPlus className="size-4" aria-hidden /> Nouvelle activité
          </LinkButton>
        }
      />

      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Aucune activité"
          description="Commencez par créer la première activité du parc."
          action={<LinkButton href="/admin/activites/nouvelle">Créer une activité</LinkButton>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-ink bg-paper-deep text-xs tracking-widest text-ink uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-extrabold">Activité</th>
                  <th scope="col" className="px-5 py-3 font-extrabold">Date</th>
                  <th scope="col" className="px-5 py-3 font-extrabold">Places</th>
                  <th scope="col" className="px-5 py-3 text-right font-extrabold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-dashed divide-ink/10">
                {activities.map((activity) => {
                  const isPast = activity.datetimeDebut <= now;
                  return (
                    <tr key={activity.id} className={isPast ? "bg-paper/70 text-ink-muted" : "hover:bg-lime/25"}>
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-ink">{activity.nom}</p>
                        <p className="mt-0.5 text-xs text-ink-subtle">
                          {activity.typeNom} · {formatDuration(activity.duree)}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {formatDateTime(activity.datetimeDebut)}
                        {isPast && <Badge className="ml-2">Terminée</Badge>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-ink tabular-nums">
                          {activity.placesReservees}/{activity.placesDisponibles}
                        </span>
                        {activity.placesRestantes === 0 && (
                          <Badge tone="red" className="ml-2">
                            Complet
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <LinkButton href={`/activites/${activity.id}`} variant="ghost" size="sm" aria-label={`Voir ${activity.nom}`}>
                            <Eye className="size-4" aria-hidden />
                          </LinkButton>
                          <LinkButton
                            href={`/admin/activites/${activity.id}/modifier`}
                            variant="ghost"
                            size="sm"
                            aria-label={`Modifier ${activity.nom}`}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </LinkButton>
                          <DeleteActivityButton
                            activityId={activity.id}
                            activityName={activity.nom}
                            reservedCount={isPast ? 0 : activity.placesReservees}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
