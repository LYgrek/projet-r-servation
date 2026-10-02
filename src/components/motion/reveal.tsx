"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, MOTION_OK, ScrollTrigger, showNow, useGSAP } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Décalage vertical de départ, en pixels. */
  y?: number;
  /** Légère rotation de départ (effet « carte posée sur la table »). */
  rotate?: number;
  /** Délai entre deux éléments d'un même groupe. */
  stagger?: number;
}

/**
 * Fait apparaître au défilement tous les éléments `[data-reveal]` contenus
 * dans ce composant (par groupes, avec un léger décalage).
 *
 * Les éléments ajoutés plus tard (ex. une liste rafraîchie par le serveur
 * après une annulation) sont détectés par un `MutationObserver` et révélés
 * à leur tour.
 *
 * La liste des éléments déjà traités est locale à chaque exécution : si GSAP
 * annule les animations (démontage, ou double montage du mode strict de React
 * en développement), tout est rejoué proprement au montage suivant.
 */
export function Reveal({ children, className, as: Tag = "div", y = 48, rotate = 0, stagger = 0.08 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const container = ref.current;
      if (!container || !contextSafe) return;
      const handled = new WeakSet<Element>();

      // `contextSafe` : les animations créées ici (même plus tard, depuis
      // l'observateur) sont rattachées au contexte et nettoyées au démontage.
      const revealNew = contextSafe(() => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", container).filter((el) => !handled.has(el));
        if (targets.length === 0) return;
        targets.forEach((el) => handled.add(el));

        if (!window.matchMedia(MOTION_OK).matches) {
          showNow(targets);
          return;
        }

        gsap.set(targets, { autoAlpha: 0, y, rotate });
        ScrollTrigger.batch(targets, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              rotate: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger,
              overwrite: true,
            }),
        });
      });

      revealNew();
      const observer = new MutationObserver(() => revealNew());
      observer.observe(container, { childList: true, subtree: true });
      return () => observer.disconnect();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
