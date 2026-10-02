"use client";

import { useActionState, useState } from "react";
import { cancelReservation } from "@/actions/reservations";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";
import { withToast } from "@/lib/with-toast";

interface CancelReservationButtonProps {
  reservationId: number;
  activityName: string;
}

/** Bouton d'annulation d'une réservation, avec demande de confirmation. */
export function CancelReservationButton({ reservationId, activityName }: CancelReservationButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(withToast(cancelReservation), initialActionState);

  // Ferme la boîte de dialogue dès que le serveur a répondu.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    setOpen(false);
  }

  return (
    <>
      <Button variant="danger-ghost" size="sm" onClick={() => setOpen(true)}>
        Annuler
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Annuler cette réservation ?"
        description={
          <>
            Votre place pour <strong className="text-ink">{activityName}</strong> sera libérée et proposée à d&apos;autres
            visiteurs.
          </>
        }
      >
        <form action={formAction}>
          <input type="hidden" name="reservationId" value={reservationId} />
          <SubmitButton variant="danger" pendingLabel="Annulation…" className="w-full">
            Oui, annuler
          </SubmitButton>
        </form>
      </ConfirmDialog>
    </>
  );
}
