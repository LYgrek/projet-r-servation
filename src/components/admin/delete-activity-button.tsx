"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteActivity } from "@/actions/activities";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";
import { withToast } from "@/lib/with-toast";

interface DeleteActivityButtonProps {
  activityId: number;
  activityName: string;
  /** Nombre de réservations actives : affiché dans l'avertissement. */
  reservedCount: number;
}

/** Bouton de suppression d'une activité avec confirmation. */
export function DeleteActivityButton({ activityId, activityName, reservedCount }: DeleteActivityButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(withToast(deleteActivity), initialActionState);

  // Ferme la boîte de dialogue dès que le serveur a répondu.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    setOpen(false);
  }

  return (
    <>
      <Button variant="danger-ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Supprimer ${activityName}`}>
        <Trash2 className="size-4" aria-hidden />
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Supprimer cette activité ?"
        description={
          <>
            <p>
              L&apos;activité <strong className="text-ink">{activityName}</strong> sera définitivement supprimée.
            </p>
            {reservedCount > 0 && (
              <p className="mt-2 font-medium text-red-700">
                {reservedCount} réservation(s) active(s) seront annulées et les participants prévenus par email.
              </p>
            )}
          </>
        }
      >
        <form action={formAction}>
          <input type="hidden" name="id" value={activityId} />
          <SubmitButton variant="danger" pendingLabel="Suppression…" className="w-full">
            Supprimer
          </SubmitButton>
        </form>
      </ConfirmDialog>
    </>
  );
}
