"use client";

import { Search, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { controlStyles } from "@/components/ui/field";
import type { TypeActivite } from "@/db/schema";
import { cn } from "@/lib/cn";

export type Period = "upcoming" | "past" | "all";

interface ActivityFiltersProps {
  types: TypeActivite[];
  search: string;
  typeId?: number;
  period: Period;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passées" },
  { value: "all", label: "Toutes" },
];

/**
 * Barre de recherche et de filtres des activités.
 *
 * Utilise le composant `<Form>` de Next.js : les filtres sont placés dans
 * l'URL (`?q=...&type=...`), ce qui rend la recherche partageable et
 * fonctionnelle même sans JavaScript. Changer le type ou la période relance
 * automatiquement la recherche.
 */
export function ActivityFilters({ types, search, typeId, period }: ActivityFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasFilters = Boolean(search || typeId || period !== "upcoming");

  return (
    <Form
      ref={formRef}
      action="/activites"
      className="mb-10 rounded-[2rem] border-2 border-ink bg-card p-3 shadow-hard"
      role="search"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <label htmlFor="q" className="sr-only">
            Rechercher une activité par nom
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink" aria-hidden />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Rechercher une activité…"
            className={cn(controlStyles, "h-12 rounded-full pl-11")}
          />
        </div>

        <label htmlFor="type" className="sr-only">
          Type d&apos;activité
        </label>
        <select
          id="type"
          name="type"
          defaultValue={typeId ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className={cn(controlStyles, "h-12 rounded-full md:w-56")}
        >
          <option value="">Tous les types</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nom}
            </option>
          ))}
        </select>

        <fieldset className="flex rounded-full border-2 border-ink bg-paper p-1">
          <legend className="sr-only">Période</legend>
          {PERIODS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold text-ink-muted transition has-checked:bg-lime has-checked:text-ink has-checked:ring-2 has-checked:ring-ink has-focus-visible:outline-3 has-focus-visible:outline-sun"
            >
              <input
                type="radio"
                name="periode"
                value={option.value}
                defaultChecked={period === option.value}
                onChange={() => formRef.current?.requestSubmit()}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <Button type="submit" className="h-12">
          Rechercher
        </Button>
      </div>

      {hasFilters && (
        <div className="mt-3 flex items-center justify-end border-t-2 border-dashed border-ink/20 px-2 pt-3">
          <Link href="/activites" className="flex items-center gap-1 text-sm font-bold text-ink-muted hover:text-sun">
            <X className="size-4" aria-hidden /> Réinitialiser les filtres
          </Link>
        </div>
      )}
    </Form>
  );
}
