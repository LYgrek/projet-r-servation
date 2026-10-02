"use client";

import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { createReservation } from "@/actions/reservations";
import { LinkButton } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";
import { withToast } from "@/lib/with-toast";

interface ReserveButtonProps {
  activityId: number;
}

/**
 * Formulaire de réservation d'une activité.
 * Le serveur revérifie toutes les règles (places, doublon, date) :
 * le bouton n'est qu'une commodité d'interface.
 */
export function ReserveButton({ activityId }: ReserveButtonProps) {
  const [state, formAction] = useActionState(withToast(createReservation), initialActionState);

  if (state.status === "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-lime px-4 py-3 text-sm font-bold" role="status">
          <CheckCircle2 className="size-5" aria-hidden /> Ta place est réservée !
        </p>
        <LinkButton href="/reservations" variant="secondary" className="w-full">
          Voir mes réservations
        </LinkButton>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="activiteId" value={activityId} />
      <SubmitButton size="lg" variant="accent" className="w-full" pendingLabel="Réservation…">
        <CalendarPlus className="size-5" aria-hidden /> Réserver ma place
      </SubmitButton>
    </form>
  );
}
