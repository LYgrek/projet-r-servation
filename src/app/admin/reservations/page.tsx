import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { formatDateTime } from "@/lib/dates";
import { listAllReservations } from "@/lib/queries/reservations";

export const metadata: Metadata = {
  title: "Réservations",
  description: "Historique de toutes les réservations effectuées au parc.",
};

/** Liste de toutes les réservations du parc (lecture seule). */
export default async function AdminReservationsPage() {
  await requireAdmin();
  const reservations = await listAllReservations();
  const actives = reservations.filter((r) => r.etat).length;

  return (
    <>
      <PageHeader
        title="Réservations"
        description={`${reservations.length} réservation(s) · ${actives} active(s) · ${reservations.length - actives} annulée(s)`}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink bg-paper-deep text-xs tracking-widest text-ink uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-extrabold">Participant</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Activité</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Date de l&apos;activité</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Réservé le</th>
                <th scope="col" className="px-5 py-3 font-extrabold">État</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-ink/10">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-lime/25">
                  <td className="px-5 py-3.5">
                    <p className="font-bold">
                      {reservation.user.prenom} {reservation.user.nom}
                    </p>
                    <p className="text-xs text-ink-subtle">{reservation.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/activites/${reservation.activite.id}`} className="font-bold hover:text-brand-700">
                      {reservation.activite.nom}
                    </Link>
                    <p className="text-xs text-ink-subtle">{reservation.activite.typeNom}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-ink-muted">
                    {formatDateTime(reservation.activite.datetimeDebut)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-ink-muted">{formatDateTime(reservation.dateReservation)}</td>
                  <td className="px-5 py-3.5">
                    {reservation.etat ? <Badge tone="lime">Active</Badge> : <Badge tone="red">Annulée</Badge>}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-muted">
                    Aucune réservation pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
