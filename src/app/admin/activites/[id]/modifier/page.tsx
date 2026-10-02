import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/components/admin/activity-form";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { toParkDateTimeInput } from "@/lib/dates";
import { getActivity, listTypes } from "@/lib/queries/activities";
import { idSchema } from "@/lib/validation";

/** Titre de l'onglet : nom de l'activité modifiée. */
export async function generateMetadata({ params }: PageProps<"/admin/activites/[id]/modifier">): Promise<Metadata> {
  const parsed = idSchema.safeParse((await params).id);
  const activity = parsed.success ? await getActivity(parsed.data) : null;
  return {
    title: activity ? `Modifier « ${activity.nom} »` : "Activité introuvable",
    description: "Modifier les informations d'une activité du parc.",
  };
}

/** Page de modification d'une activité. */
export default async function EditActivityPage({ params }: PageProps<"/admin/activites/[id]/modifier">) {
  await requireAdmin();
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();

  const [activity, types] = await Promise.all([getActivity(parsed.data), listTypes()]);
  if (!activity) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Modifier l'activité" description={activity.nom} />
      {/* `key` : le formulaire est remonté si l'on passe d'une activité à une autre. */}
      <ActivityForm
        key={activity.id}
        types={types}
        reservedCount={activity.placesReservees}
        initialValues={{
          id: String(activity.id),
          nom: activity.nom,
          typeId: String(activity.typeId),
          placesDisponibles: String(activity.placesDisponibles),
          description: activity.description,
          datetimeDebut: toParkDateTimeInput(activity.datetimeDebut),
          duree: String(activity.duree),
        }}
      />
    </div>
  );
}
