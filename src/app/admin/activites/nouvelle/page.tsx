import { Tags } from "lucide-react";
import type { Metadata } from "next";
import { ActivityForm } from "@/components/admin/activity-form";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { tomorrowAtParkHourInput, toParkDateTimeInput } from "@/lib/dates";
import { listTypes } from "@/lib/queries/activities";

export const metadata: Metadata = {
  title: "Nouvelle activité",
  description: "Ajouter une nouvelle activité au programme du parc.",
};

/** Page de création d'une activité. */
export default async function NewActivityPage() {
  await requireAdmin();
  const types = await listTypes();

  // Valeur proposée par défaut : demain à 10h (heure de Paris).
  const defaultStart = tomorrowAtParkHourInput(10);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Nouvelle activité" description="Renseignez les informations de l'activité à ajouter au programme." />
      {types.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Aucun type d'activité"
          description="Créez d'abord au moins un type d'activité (ex. : Accrobranche)."
          action={<LinkButton href="/admin/types">Gérer les types</LinkButton>}
        />
      ) : (
        <ActivityForm
          types={types}
          minDate={toParkDateTimeInput(new Date())}
          initialValues={{
            nom: "",
            typeId: "",
            placesDisponibles: "10",
            description: "",
            datetimeDebut: defaultStart,
            duree: "60",
          }}
        />
      )}
    </div>
  );
}
