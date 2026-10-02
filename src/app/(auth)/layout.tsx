import { Check, Mountain, TreePine, Waves } from "lucide-react";
import { Float } from "@/components/motion/decor";
import { Intro } from "@/components/motion/intro";

const PERKS = ["Réservation en deux clics", "Annulation gratuite jusqu'au départ", "Confirmation par email"];

/**
 * Mise en page commune aux pages de connexion et d'inscription :
 * un panneau illustré à gauche (grand écran) et le formulaire à droite.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-16">
      <Intro className="hidden lg:block" y={40}>
        <aside
          data-intro
          className="relative flex h-full min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 border-ink bg-brand-800 p-10 text-card shadow-hard-lg"
        >
          <div className="bg-topo absolute inset-0 text-lime" aria-hidden />

          <Float className="absolute top-10 right-10" duration={3.2}>
            <span className="grid size-20 rotate-6 place-items-center rounded-2xl border-2 border-ink bg-lime text-ink">
              <TreePine className="size-10" />
            </span>
          </Float>
          <Float className="absolute top-44 right-36" duration={2.6} delay={0.5} rotate={-10}>
            <span className="grid size-14 place-items-center rounded-full border-2 border-ink bg-sun text-ink">
              <Mountain className="size-7" />
            </span>
          </Float>
          <Float className="absolute right-12 bottom-40" duration={3.6} delay={0.2} y={10}>
            <span className="grid size-16 -rotate-6 place-items-center rounded-2xl border-2 border-ink bg-blush text-ink">
              <Waves className="size-8" />
            </span>
          </Float>

          <p className="relative text-xs font-extrabold tracking-[0.3em] text-lime uppercase">✳ Parc Évasion</p>

          <div className="relative">
            <p className="max-w-sm font-serif text-5xl leading-[1.05]">
              « La forêt est le plus beau des <em className="text-lime">terrains de jeu</em>. »
            </p>
            <ul className="mt-8 space-y-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 font-bold">
                  <span className="grid size-6 place-items-center rounded-full border-2 border-ink bg-lime text-ink">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Intro>

      <Intro delay={0.15} className="flex items-center">
        <div data-intro className="w-full">
          {children}
        </div>
      </Intro>
    </div>
  );
}
