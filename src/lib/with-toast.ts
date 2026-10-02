"use client";

import { toast } from "sonner";
import type { ActionState } from "./action-state";

type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Enveloppe une Server Action pour afficher automatiquement une notification
 * (toast) avec le message de succès ou d'erreur renvoyé par le serveur.
 *
 * La notification est déclenchée dès la réponse du serveur, même si le
 * composant qui a lancé l'action disparaît ensuite (ex. ligne supprimée).
 */
export function withToast(action: FormAction): FormAction {
  return async (prev, formData) => {
    const result = await action(prev, formData);
    // `result` peut être vide si l'action a déclenché une redirection.
    if (result?.message) {
      if (result.status === "success") toast.success(result.message);
      else if (result.status === "error") toast.error(result.message);
    }
    return result;
  };
}
