"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, MOTION_OK, MOTION_REDUCED, showNow, SplitText, useGSAP } from "@/lib/gsap";

interface SplitTitleProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Délai avant le début de l'animation (en secondes). */
  delay?: number;
}

/**
 * Titre dont les lettres « montent » une à une depuis un masque.
 * SplitText découpe le texte (y compris les `<em>` imbriqués) et ajoute
 * automatiquement un `aria-label` pour les lecteurs d'écran.
 */
export function SplitTitle({ children, as: Tag = "h1", className, delay = 0.1 }: SplitTitleProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, {
          type: "words,chars",
          mask: "chars",
          // Redécoupe automatiquement si la police finit de charger ou si
          // la largeur change ; l'animation renvoyée est alors reprise.
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.chars, {
              yPercent: 115,
              rotate: 8,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.018,
              delay,
            });
          },
        });
        return () => split.revert();
      });
      mm.add(MOTION_REDUCED, () => showNow(el));
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-intro data-split>
      {children}
    </Tag>
  );
}
