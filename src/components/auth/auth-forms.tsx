"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

/** Formulaire de connexion. `redirectTo` : page où revenir après connexion. */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(login, initialActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message && <Alert tone="error">{state.message}</Alert>}
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

      <Field id="email" label="Adresse email" errors={errors.email}>
        {(aria) => (
          <Input {...aria} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
        )}
      </Field>
      <Field id="motdepasse" label="Mot de passe" errors={errors.motdepasse}>
        {(aria) => <Input {...aria} name="motdepasse" type="password" autoComplete="current-password" required />}
      </Field>

      <SubmitButton size="lg" className="w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>

      <p className="text-center text-sm text-ink-muted">
        Pas encore de compte ?{" "}
        <Link
          href={redirectTo ? `/inscription?redirect=${encodeURIComponent(redirectTo)}` : "/inscription"}
          className="font-bold text-brand-700 underline decoration-2 underline-offset-2 hover:text-sun"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

/** Formulaire d'inscription. */
export function SignupForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(signup, initialActionState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message && <Alert tone="error">{state.message}</Alert>}
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

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
      <Field
        id="motdepasse"
        label="Mot de passe"
        errors={errors.motdepasse}
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
      >
        {(aria) => <Input {...aria} name="motdepasse" type="password" autoComplete="new-password" required minLength={8} />}
      </Field>
      <Field id="confirmation" label="Confirmation du mot de passe" errors={errors.confirmation}>
        {(aria) => <Input {...aria} name="confirmation" type="password" autoComplete="new-password" required />}
      </Field>

      <SubmitButton size="lg" className="w-full" pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>

      <p className="text-center text-sm text-ink-muted">
        Déjà inscrit ?{" "}
        <Link
          href={redirectTo ? `/connexion?redirect=${encodeURIComponent(redirectTo)}` : "/connexion"}
          className="font-bold text-brand-700 underline decoration-2 underline-offset-2 hover:text-sun"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
