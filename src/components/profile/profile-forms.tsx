"use client";

import { useActionState, useState } from "react";
import { changePassword, deleteAccount, updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import type { PublicUser } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";
import { withToast } from "@/lib/with-toast";

/** Formulaire de modification des informations personnelles. */
export function ProfileForm({ user }: { user: PublicUser }) {
  const [state, formAction] = useActionState(withToast(updateProfile), initialActionState);
  const errors = state.fieldErrors ?? {};
  // En cas d'erreur, on réaffiche la saisie ; sinon les valeurs enregistrées.
  const values = state.status === "error" && state.values ? state.values : user;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="prenom" label="Prénom" errors={errors.prenom}>
          {(aria) => <Input {...aria} name="prenom" autoComplete="given-name" required defaultValue={values.prenom} />}
        </Field>
        <Field id="nom" label="Nom" errors={errors.nom}>
          {(aria) => <Input {...aria} name="nom" autoComplete="family-name" required defaultValue={values.nom} />}
        </Field>
      </div>
      <Field id="email" label="Adresse email" errors={errors.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" required defaultValue={values.email} />}
      </Field>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Enregistrement…">Enregistrer les modifications</SubmitButton>
      </div>
    </form>
  );
}

/** Formulaire de changement de mot de passe. */
export function PasswordForm() {
  const [state, formAction] = useActionState(withToast(changePassword), initialActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field id="actuel" label="Mot de passe actuel" errors={errors.actuel}>
        {(aria) => <Input {...aria} name="actuel" type="password" autoComplete="current-password" required />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="nouveau" label="Nouveau mot de passe" errors={errors.nouveau} hint="8 caractères min., lettres et chiffres.">
          {(aria) => <Input {...aria} name="nouveau" type="password" autoComplete="new-password" required />}
        </Field>
        <Field id="confirmation-mdp" label="Confirmation" errors={errors.confirmation}>
          {(aria) => <Input {...aria} name="confirmation" type="password" autoComplete="new-password" required />}
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary" pendingLabel="Modification…">
          Changer le mot de passe
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Zone de suppression du compte. L'utilisateur doit confirmer dans une
 * boîte de dialogue en retapant son adresse email.
 */
export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(withToast(deleteAccount), initialActionState);
  const confirmError = state.fieldErrors?.confirmation;

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Supprimer mon compte
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Supprimer définitivement votre compte ?"
        description={
          <div className="space-y-4">
            <p>Toutes vos réservations seront supprimées. Cette action est irréversible.</p>
            {state.status === "error" && state.message && <Alert tone="error">{state.message}</Alert>}
            <Field id="confirmation" label={`Tapez « ${email} » pour confirmer`} errors={confirmError}>
              {(aria) => <Input {...aria} form="delete-account-form" name="confirmation" autoComplete="off" />}
            </Field>
          </div>
        }
      >
        <form id="delete-account-form" action={formAction}>
          <SubmitButton variant="danger" pendingLabel="Suppression…" className="w-full">
            Supprimer mon compte
          </SubmitButton>
        </form>
      </ConfirmDialog>
    </>
  );
}
