"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

interface CountUpProps {
  value: number;
  /** `percent` : la valeur est une proportion entre 0 et 1. */
  format?: "number" | "percent";
  className?: string;
}

const formatters = {
  number: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }),
  percent: new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 }),
};

/**
 * Nombre qui « compte » jusqu'à sa valeur quand il entre dans l'écran.
 * La valeur finale est rendue côté serveur : sans JavaScript, elle s'affiche
 * directement.
 */
export function CountUp({ value, format = "number", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatter = formatters[format];

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const counter = { n: 0 };
        el.textContent = formatter.format(0);
        gsap.to(counter, {
          n: value,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = formatter.format(counter.n);
          },
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        });
        return () => {
          el.textContent = formatter.format(value);
        };
      });
    },
    { scope: ref, dependencies: [value, format], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className={className}>
      {formatter.format(value)}
    </span>
  );
}
