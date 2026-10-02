"use client";

/**
 * Effets liés au pointeur de la souris : bouton « aimanté » et carte qui
 * s'incline en 3D. Désactivés sur écran tactile et si l'utilisateur préfère
 * réduire les animations.
 */
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

const FINE_POINTER = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/** L'élément est légèrement attiré par le curseur lorsqu'il passe à proximité. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
          yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}

/** La carte s'incline en suivant le curseur, comme une carte postale tenue en main. */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        gsap.set(el, { transformPerspective: 900 });
        const rxTo = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ryTo = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          ryTo(px * max * 2);
          rxTo(-py * max * 2);
        };
        const onLeave = () => {
          rxTo(0);
          ryTo(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
