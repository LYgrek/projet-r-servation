"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";
import { createType, deleteType, renameType } from "@/actions/types";
import { getTypeVisual } from "@/components/activities/type-visual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import type { TypeActivite } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";
import { withToast } from "@/lib/with-toast";

type TypeWithCount = TypeActivite & { nbActivites: number };

/** Gestion des types d'activité : ajout, renommage en ligne et suppression. */
export function TypeManager({ types }: { types: TypeWithCount[] }) {
  return (
    <div className="space-y-6">
      <CreateTypeForm />
      <Card className="overflow-hidden">
        <ul className="divide-y-2 divide-dashed divide-ink/15">
          {types.map((type) => (
            <TypeRow key={type.id} type={type} />
          ))}
          {types.length === 0 && <li className="px-5 py-8 text-center text-sm text-ink-muted">Aucun type pour le moment.</li>}
        </ul>
      </Card>
    </div>
  );
}

/** Formulaire d'ajout d'un type. */
function CreateTypeForm() {
  const [state, formAction] = useActionState(withToast(createType), initialActionState);
  const error = state.fieldErrors?.nom?.[0];

  return (
    <Card className="p-5">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
        <div className="flex-1">
          <label htmlFor="new-type" className="sr-only">
            Nom du nouveau type
          </label>
          <Input
            id="new-type"
            name="nom"
            placeholder="Nom du nouveau type (ex. : Tir à l'arc)"
            required
            maxLength={50}
            defaultValue={state.status === "error" ? state.values?.nom : ""}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "new-type-error" : undefined}
          />
          {error && (
            <p id="new-type-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <SubmitButton className="h-11" pendingLabel="Ajout…">
          <Plus className="size-4" aria-hidden /> Ajouter
        </SubmitButton>
      </form>
    </Card>
  );
}

/** Ligne d'un type : affichage, mode édition et suppression. */
function TypeRow({ type }: { type: TypeWithCount }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction] = useActionState(withToast(renameType), initialActionState);
  const [, deleteAction] = useActionState(withToast(deleteType), initialActionState);

  // Quitte le mode édition après un renommage réussi.
  const [handledState, setHandledState] = useState(renameState);
  if (renameState !== handledState) {
    setHandledState(renameState);
    if (renameState.status === "success") setEditing(false);
  }

  const { icon: Icon, colors } = getTypeVisual(type.nom, type.id);
  const error = renameState.fieldErrors?.nom?.[0];

  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span className={`grid size-11 shrink-0 -rotate-3 place-items-center rounded-xl border-2 border-ink ${colors}`} aria-hidden>
        <Icon className="size-5" />
      </span>

      {editing ? (
        <form action={renameAction} className="flex flex-1 items-start gap-2" noValidate>
          <input type="hidden" name="id" value={type.id} />
          <div className="flex-1">
            <label htmlFor={`type-${type.id}`} className="sr-only">
              Nouveau nom
            </label>
            <Input
              id={`type-${type.id}`}
              name="nom"
              defaultValue={renameState.values?.nom ?? type.nom}
              autoFocus
              required
              maxLength={50}
              aria-invalid={error ? true : undefined}
              className="h-9"
            />
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
          </div>
          <SubmitButton size="sm" className="h-9" variant="primary">
            <Check className="size-4" aria-hidden /> <span className="sr-only">Enregistrer</span>
          </SubmitButton>
          <Button size="sm" className="h-9" variant="ghost" onClick={() => setEditing(false)} aria-label="Annuler">
            <X className="size-4" aria-hidden />
          </Button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{type.nom}</p>
            <p className="text-xs text-ink-subtle">
              {type.nbActivites} activité{type.nbActivites > 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={`Renommer ${type.nom}`}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={type.id} />
            <SubmitButton
              variant="danger-ghost"
              size="sm"
              disabled={type.nbActivites > 0}
              className="disabled:opacity-30"
            >
              <Trash2 className="size-4" aria-hidden />
              <span className="sr-only">
                {type.nbActivites > 0 ? `Impossible de supprimer ${type.nom} : type utilisé` : `Supprimer ${type.nom}`}
              </span>
            </SubmitButton>
          </form>
        </>
      )}
    </li>
  );
}
