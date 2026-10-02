import type { Metadata } from "next";
import { TypeManager } from "@/components/admin/type-manager";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { listTypesWithCount } from "@/lib/queries/activities";

export const metadata: Metadata = {
  title: "Types d'activité",
  description: "Gérer les catégories d'activités proposées par le parc.",
};

/** Page de gestion des types d'activité. */
export default async function AdminTypesPage() {
  await requireAdmin();
  const types = await listTypesWithCount();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Types d'activité"
        description="Un type ne peut être supprimé que s'il n'est utilisé par aucune activité."
      />
      <TypeManager types={types} />
    </div>
  );
}
