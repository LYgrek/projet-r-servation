"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Vitesse de défilement en pixels par seconde. */
  speed?: number;
  /** Défile vers la droite au lieu de la gauche. */
  reverse?: boolean;
}

/**
 * Bandeau défilant en boucle infinie. Le contenu est dupliqué pour que la
 * boucle soit invisible, et le sens s'inverse selon le sens du défilement
 * de la page (petit clin d'œil interactif).
 */
export function Marquee({ children, className, speed = 70, reverse = false }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const distance = track.scrollWidth / 2;
        const loop = gsap.fromTo(
          track,
          { x: reverse ? -distance : 0 },
          { x: reverse ? 0 : -distance, duration: distance / speed, ease: "none", repeat: -1 },
        );

        // Le bandeau accélère et change de sens avec le défilement de la page.
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = Math.min(Math.abs(self.getVelocity()) / 300, 4);
            gsap.to(loop, { timeScale: self.direction * (1 + velocity), duration: 0.3, overwrite: true });
            gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.3 });
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
