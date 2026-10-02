"use client";

import { useActionState } from "react";
import { createActivity, updateActivity } from "@/actions/activities";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert, Card } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import type { TypeActivite } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";

/** Valeurs initiales du formulaire, sous forme de chaînes (comme dans un `<input>`). */
export interface ActivityFormValues {
  id?: string;
  nom: string;
  typeId: string;
  placesDisponibles: string;
  description: string;
  datetimeDebut: string;
  duree: string;
}

interface ActivityFormProps {
  types: TypeActivite[];
  /** Absent : création. Présent : modification de l'activité. */
  initialValues?: ActivityFormValues;
  /** Valeur minimale du champ date (création uniquement). */
  minDate?: string;
  /** Nombre de places déjà réservées (modification uniquement). */
  reservedCount?: number;
}

/** Formulaire de création / modification d'une activité. */
export function ActivityForm({ types, initialValues, minDate, reservedCount = 0 }: ActivityFormProps) {
  const isEdit = Boolean(initialValues?.id);
  const [state, formAction] = useActionState(isEdit ? updateActivity : createActivity, initialActionState);
  const errors = state.fieldErrors ?? {};
  // Après une erreur, on réaffiche la saisie de l'utilisateur.
  const values: Partial<ActivityFormValues> = state.values ?? initialValues ?? {};

  return (
    <form action={formAction} noValidate>
      {isEdit && <input type="hidden" name="id" value={initialValues?.id} />}

      <Card className="space-y-6 p-6 md:p-8">
        {state.status === "error" && state.message && <Alert tone="error">{state.message}</Alert>}

        <Field id="nom" label="Nom de l'activité" errors={errors.nom}>
          {(aria) => <Input {...aria} name="nom" required maxLength={100} defaultValue={values.nom} placeholder="Ex. : Parcours des Cimes" />}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="typeId" label="Type d'activité" errors={errors.typeId}>
            {(aria) => (
              <Select {...aria} name="typeId" required defaultValue={values.typeId ?? ""}>
                <option value="" disabled>
                  Choisir un type…
                </option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nom}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            id="placesDisponibles"
            label="Nombre de places"
            errors={errors.placesDisponibles}
            hint={isEdit && reservedCount > 0 ? `${reservedCount} place(s) déjà réservée(s).` : "Capacité maximale de l'activité."}
          >
            {(aria) => (
              <Input
                {...aria}
                name="placesDisponibles"
                type="number"
                required
                min={Math.max(1, reservedCount)}
                max={500}
                defaultValue={values.placesDisponibles}
              />
            )}
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="datetimeDebut" label="Date et heure de début" errors={errors.datetimeDebut} hint="Heure de Paris.">
            {(aria) => (
              <Input {...aria} name="datetimeDebut" type="datetime-local" required min={minDate} defaultValue={values.datetimeDebut} />
            )}
          </Field>
          <Field id="duree" label="Durée (en minutes)" errors={errors.duree} hint="Entre 15 minutes et 12 heures.">
            {(aria) => <Input {...aria} name="duree" type="number" required min={15} max={720} step={5} defaultValue={values.duree} />}
          </Field>
        </div>

        <Field id="description" label="Description" errors={errors.description}>
          {(aria) => (
            <Textarea
              {...aria}
              name="description"
              required
              rows={6}
              maxLength={2000}
              defaultValue={values.description}
              placeholder="Déroulé, public concerné, équipement fourni…"
            />
          )}
        </Field>

        <div className="flex flex-col-reverse gap-3 border-t-2 border-dashed border-ink/20 pt-6 sm:flex-row sm:justify-end">
          <LinkButton href="/admin/activites" variant="secondary">
            Annuler
          </LinkButton>
          <SubmitButton pendingLabel="Enregistrement…">{isEdit ? "Enregistrer les modifications" : "Créer l'activité"}</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
