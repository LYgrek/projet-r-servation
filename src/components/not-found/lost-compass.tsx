"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * Boussole déboussolée de la page 404 : l'aiguille tourne dans tous les sens
 * sans jamais trouver le nord, et se tourne vers le curseur quand il approche.
 */
export function LostCompass() {
  const ref = useRef<HTMLDivElement>(null);
  const needleRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const needle = needleRef.current;
        gsap.set(needle, { transformOrigin: "50% 50%" });

        // Rotation aléatoire en boucle : l'aiguille « cherche » le nord.
        // `repeatRefresh` tire une nouvelle valeur aléatoire à chaque répétition.
        gsap.to(needle, {
          rotation: "random(-220, 220)",
          duration: 1.1,
          ease: "elastic.out(1, 0.4)",
          repeat: -1,
          repeatRefresh: true,
          repeatDelay: 0.4,
        });

        // Toute la boussole oscille légèrement.
        gsap.to(ref.current, { rotate: 6, y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="mx-auto size-48 md:size-56" aria-hidden>
      <svg viewBox="0 0 200 200" className="size-full drop-shadow-[6px_6px_0_var(--color-ink)]">
        <circle cx="100" cy="100" r="92" className="fill-lime stroke-ink" strokeWidth="4" />
        <circle cx="100" cy="100" r="72" className="fill-card stroke-ink" strokeWidth="3" strokeDasharray="6 6" />
        {["N", "E", "S", "O"].map((letter, index) => {
          const angle = (index * Math.PI) / 2;
          return (
            <text
              key={letter}
              x={100 + Math.sin(angle) * 56}
              y={100 - Math.cos(angle) * 56 + 7}
              textAnchor="middle"
              className="fill-ink text-[20px] font-extrabold"
            >
              {letter}
            </text>
          );
        })}
        <g ref={needleRef}>
          <path d="M100 38 L114 100 L100 100Z" className="fill-sun stroke-ink" strokeWidth="3" strokeLinejoin="round" />
          <path d="M100 38 L86 100 L100 100Z" className="fill-sun-soft stroke-ink" strokeWidth="3" strokeLinejoin="round" />
          <path d="M100 162 L114 100 L100 100Z" className="fill-ink stroke-ink" strokeWidth="3" strokeLinejoin="round" />
          <path d="M100 162 L86 100 L100 100Z" className="fill-ink-muted stroke-ink" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="100" r="9" className="fill-card stroke-ink" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}
