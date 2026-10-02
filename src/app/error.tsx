"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/button";

/** Page affichée lorsqu'une erreur inattendue survient pendant le rendu. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="px-4 py-24 text-center">
      <title>Une erreur est survenue · Parc Évasion</title>
      <div className="mx-auto mb-8 grid size-20 rotate-6 place-items-center rounded-2xl border-2 border-ink bg-sun shadow-hard">
        <TriangleAlert className="size-10" aria-hidden />
      </div>
      <h1 className="text-4xl leading-none font-extrabold tracking-tight md:text-6xl">
        Oups, une <em className="font-serif font-normal text-brand-700">chute de pierres</em>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-lg text-ink-muted">
        Une erreur inattendue est survenue. Tu peux réessayer ou revenir à l&apos;accueil.
      </p>
      {error.digest && <p className="mt-2 text-xs text-ink-subtle">Référence : {error.digest}</p>}
      <div className="mt-10 flex justify-center gap-4">
        <Button onClick={reset} size="lg">
          <RotateCcw className="size-5" aria-hidden /> Réessayer
        </Button>
        <LinkButton href="/" variant="secondary" size="lg">
          Accueil
        </LinkButton>
      </div>
    </div>
  );
}
