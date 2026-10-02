"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, MOTION_OK, MOTION_REDUCED, showNow, useGSAP } from "@/lib/gsap";

interface IntroProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  y?: number;
}

/**
 * Animation d'entrée au chargement : les éléments `[data-intro]` contenus
 * (ou le conteneur lui-même s'il n'y en a pas) apparaissent l'un après l'autre.
 * À utiliser pour le haut de page, visible sans défiler.
 */
export function Intro({ children, className, as: Tag = "div", delay = 0.25, y = 24 }: IntroProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const container = ref.current;
      if (!container) return;
      // Les titres découpés (SplitTitle) gèrent leur propre animation.
      const inner = gsap.utils.toArray<HTMLElement>("[data-intro]:not([data-split])", container);
      const targets = inner.length > 0 ? inner : [container];

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay },
        );
      });
      mm.add(MOTION_REDUCED, () => showNow(targets));
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
