import { Home, Map } from "lucide-react";
import type { Metadata } from "next";
import { Float } from "@/components/motion/decor";
import { Intro } from "@/components/motion/intro";
import { SplitTitle } from "@/components/motion/split-title";
import { LostCompass } from "@/components/not-found/lost-compass";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

/** Page 404 stylisée, affichée pour toute URL inconnue ou ressource absente. */
export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-20 text-center sm:py-24">
      {/* Gros « 404 » en contour, en arrière-plan */}
      <p
        className="text-outline pointer-events-none absolute inset-x-0 top-6 text-[clamp(8rem,30vw,20rem)] leading-none font-extrabold tracking-tighter opacity-15 select-none"
        aria-hidden
      >
        404
      </p>

      <Float className="absolute top-24 left-[6%] hidden sm:block" duration={3} rotate={-12}>
        <span className="block rotate-[-8deg] rounded-lg border-2 border-ink bg-sun px-3 py-1 text-sm font-extrabold tracking-widest uppercase">
          Hors-piste
        </span>
      </Float>
      <Float className="absolute top-40 right-[6%] hidden sm:block" duration={3.6} delay={0.4}>
        <span className="block rotate-6 rounded-lg border-2 border-ink bg-blush px-3 py-1 text-sm font-extrabold tracking-widest uppercase">
          Erreur 404
        </span>
      </Float>

      <div className="relative">
        <LostCompass />

        <SplitTitle className="mt-10 text-5xl leading-[0.9] font-extrabold tracking-tight text-balance md:text-7xl" delay={0.3}>
          Perdu en <em className="font-serif font-normal text-brand-700">forêt…</em>
        </SplitTitle>

        <Intro delay={0.7}>
          <p data-intro className="mx-auto mt-6 max-w-md text-lg text-ink-muted">
            Même notre boussole ne retrouve pas cette page. Elle n&apos;existe pas, a été déplacée, ou l&apos;activité a quitté le
            programme.
          </p>
          <div data-intro className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" size="lg">
              <Home className="size-5" aria-hidden /> Retour au camp de base
            </LinkButton>
            <LinkButton href="/activites" size="lg" variant="secondary">
              <Map className="size-5" aria-hidden /> Voir les activités
            </LinkButton>
          </div>
        </Intro>
      </div>
    </div>
  );
}
