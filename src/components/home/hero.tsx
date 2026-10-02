"use client";

import { ArrowDownRight, ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SpinningBadge } from "@/components/motion/decor";
import { Magnetic } from "@/components/motion/pointer-effects";
import { SplitTitle } from "@/components/motion/split-title";
import { LinkButton } from "@/components/ui/button";
import { gsap, MOTION_OK, MOTION_REDUCED, showNow, useGSAP } from "@/lib/gsap";

interface HeroProps {
  userName?: string;
  upcomingCount: number;
  nextActivity?: { id: number; nom: string; quand: string };
}

/**
 * Bandeau d'accueil : titre animé lettre par lettre et « carte postale »
 * illustrée dont les plans (montagnes, collines, sapins) se déplacent à des
 * vitesses différentes au défilement et au mouvement de la souris.
 */
export function Hero({ userName, upcomingCount, nextActivity }: HeroProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(ref);
        gsap.set(q("[data-intro]:not([data-split])"), { autoAlpha: 1 });

        // 1. Entrée : le soleil se lève, les plans montent, les autocollants claquent.
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(q("[data-hero-text]"), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.35)
          .from(q("[data-postcard]"), { y: 80, rotate: 8, autoAlpha: 0, duration: 1.2 }, 0.1)
          .from(q("[data-sun]"), { yPercent: 260, duration: 1.6 }, 0.4)
          .from(q("[data-layer]"), { yPercent: 35, duration: 1.4, stagger: 0.12 }, 0.45)
          .from(q("[data-sticker]"), { scale: 0, rotate: -40, duration: 0.8, stagger: 0.12, ease: "back.out(2.2)" }, 1);

        // 2. Nuages qui dérivent en continu.
        q("[data-cloud]").forEach((cloud, index) => {
          gsap.to(cloud, { x: index % 2 ? -40 : 50, duration: 6 + index * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
        });

        // 3. Parallaxe au défilement : chaque plan a sa propre profondeur.
        q("[data-layer], [data-sun]").forEach((layer) => {
          const depth = Number(layer.getAttribute("data-depth") ?? 1);
          gsap.to(layer, {
            y: depth * 45,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        });
      });

      // 4. Parallaxe à la souris (écrans avec souris uniquement).
      mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
        const q = gsap.utils.selector(ref);
        const movers = q("[data-layer], [data-sun]").map((layer) => ({
          depth: Number(layer.getAttribute("data-depth") ?? 1),
          xTo: gsap.quickTo(layer, "x", { duration: 0.8, ease: "power3.out" }),
        }));
        const onMove = (event: PointerEvent) => {
          const ratio = event.clientX / window.innerWidth - 0.5;
          movers.forEach(({ depth, xTo }) => xTo(ratio * depth * -26));
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add(MOTION_REDUCED, () => showNow(gsap.utils.selector(ref)("[data-intro]")));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 md:pt-20">
      <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        {/* ---------- Texte ---------- */}
        <div>
          <p
            data-intro
            data-hero-text
            className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1 text-sm font-bold"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sun opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-sun" />
            </span>
            Saison 2026 · {upcomingCount} activités au programme
          </p>

          <SplitTitle className="text-[clamp(3.2rem,9vw,7rem)] leading-[0.88] font-extrabold tracking-tighter">
            Grimpe, pagaie,{" "}
            <em className="font-serif font-normal tracking-normal text-brand-700">respire.</em>
          </SplitTitle>

          <p data-intro data-hero-text className="mt-7 max-w-md text-lg text-ink-muted">
            {userName ? (
              <>
                Content de te revoir, <strong className="text-ink">{userName}</strong> !{" "}
              </>
            ) : null}
            Accrobranche, escalade, canoë ou yoga au bord du lac : choisis ton aventure et réserve ta place en deux clics.
          </p>

          <div data-intro data-hero-text className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <LinkButton href="/activites" size="lg" variant="inverse">
                Voir les activités <ArrowRight className="size-5" aria-hidden />
              </LinkButton>
            </Magnetic>
            {!userName && (
              <Magnetic strength={0.25}>
                <LinkButton href="/inscription" size="lg" variant="accent">
                  Créer un compte
                </LinkButton>
              </Magnetic>
            )}
          </div>
        </div>

        {/* ---------- Carte postale illustrée ---------- */}
        <div data-intro className="relative mx-auto w-full max-w-md">
          <div
            data-postcard
            className="relative aspect-[5/6] overflow-hidden rounded-[2.5rem] border-2 border-ink bg-sun-soft shadow-hard-lg"
          >
            <Landscape />
            <p className="absolute top-5 left-6 font-serif text-3xl text-ink italic">Bons baisers du parc</p>
          </div>

          {/* Autocollants posés sur la carte */}
          <SpinningBadge
            text="Réserve en ligne ✳ Annulation gratuite ✳ "
            className="absolute -top-8 -right-6 size-32 rounded-full border-2 border-ink bg-lime text-ink shadow-hard md:-right-10"
          >
            <div data-sticker className="grid size-12 place-items-center rounded-full border-2 border-ink bg-card">
              <Compass className="size-6" aria-hidden />
            </div>
          </SpinningBadge>

          <div
            data-sticker
            className="absolute -bottom-6 -left-4 rotate-[-7deg] rounded-2xl border-2 border-ink bg-card px-4 py-3 shadow-hard md:-left-10"
          >
            {nextActivity ? (
              <Link href={`/activites/${nextActivity.id}`} className="group block">
                <span className="text-[11px] font-extrabold tracking-widest text-sun uppercase">Prochaine sortie</span>
                <span className="mt-0.5 flex max-w-52 items-center gap-1 leading-tight font-extrabold">
                  <span className="truncate">{nextActivity.nom}</span>
                  <ArrowDownRight className="size-4 shrink-0 transition-transform group-hover:-rotate-90" aria-hidden />
                </span>
                <span className="text-xs text-ink-muted capitalize">{nextActivity.quand}</span>
              </Link>
            ) : (
              <span className="font-extrabold">Bientôt de nouvelles activités !</span>
            )}
          </div>

          <div
            data-sticker
            className="absolute top-1/2 -right-3 rotate-[9deg] rounded-lg border-2 border-ink bg-sun px-3 py-1 text-xs font-extrabold tracking-widest uppercase md:-right-8"
            aria-hidden
          >
            Alt. 1 450 m
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Paysage en SVG découpé en plans indépendants (`data-layer`) pour la
 * parallaxe. `data-depth` : plus la valeur est grande, plus le plan bouge.
 */
function Landscape() {
  return (
    <svg viewBox="0 0 400 480" className="absolute inset-0 size-full" aria-hidden preserveAspectRatio="xMidYMax slice">
      <g data-sun data-depth="0.4">
        <circle cx="285" cy="170" r="54" className="fill-sun stroke-ink" strokeWidth="2.5" />
      </g>
      <g data-cloud>
        <rect x="40" y="120" width="96" height="30" rx="15" className="fill-card stroke-ink" strokeWidth="2.5" />
      </g>
      <g data-cloud>
        <rect x="230" y="92" width="70" height="24" rx="12" className="fill-card stroke-ink" strokeWidth="2.5" />
      </g>
      <path d="M150 210 l8 6 l8 -6 M175 190 l6 5 l6 -5" className="fill-none stroke-ink" strokeWidth="2.5" strokeLinecap="round" />

      <g data-layer data-depth="0.8">
        <path
          d="M-20 330 L55 238 L105 285 L175 190 L245 275 L305 222 L420 300 V520 H-20Z"
          className="fill-brand-300 stroke-ink"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M175 190 L158 213 L175 208 L190 216Z" className="fill-card stroke-ink" strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g data-layer data-depth="1.4">
        <path
          d="M-20 365 L70 280 L140 340 L220 262 L300 350 L360 305 L420 340 V520 H-20Z"
          className="fill-brand-600 stroke-ink"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <g data-layer data-depth="2">
        <path d="M-20 420 Q90 380 200 410 T420 395 V520 H-20Z" className="fill-lagoon stroke-ink" strokeWidth="2.5" />
        <path d="M40 440 q12 -8 24 0 t24 0 M250 455 q12 -8 24 0 t24 0" className="fill-none stroke-card" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g data-layer data-depth="2.8">
        <path d="M-20 470 Q120 425 230 455 T420 440 V520 H-20Z" className="fill-brand-900 stroke-ink" strokeWidth="2.5" />
        {[
          [30, 440, 1],
          [62, 448, 0.75],
          [335, 432, 1.1],
          [368, 444, 0.8],
        ].map(([x, y, s]) => (
          <path
            key={x}
            d={`M${x} ${y! - 70 * s!} L${x! - 22 * s!} ${y} L${x! + 22 * s!} ${y}Z`}
            className="fill-ink stroke-ink"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
