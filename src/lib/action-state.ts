/**
 * Type commun retourné par les Server Actions utilisées avec `useActionState`.
 *
 * - `status`      : état de la dernière soumission.
 * - `message`     : message global (succès ou erreur) affiché à l'utilisateur.
 * - `fieldErrors` : erreurs de validation par champ.
 * - `values`      : valeurs saisies, renvoyées pour pré-remplir le formulaire
 *                   en cas d'erreur (React réinitialise le formulaire après l'action).
 */
export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
}

/** État initial passé à `useActionState`. */
export const initialActionState: ActionState = { status: "idle" };
