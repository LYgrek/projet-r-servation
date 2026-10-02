"use client";

/**
 * Éléments décoratifs animés : badge circulaire tournant, formes flottantes
 * et jauge qui se remplit. Purement visuels (`aria-hidden`) sauf la jauge.
 */
import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Badge rond avec un texte qui tourne autour d'un pictogramme central. */
export function SpinningBadge({ text, children, className }: { text: string; children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const pathId = `badge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const spin = gsap.to(ringRef.current, { rotation: 360, duration: 16, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
        // Accélère au survol.
        const el = ref.current;
        const fast = () => gsap.to(spin, { timeScale: 5, duration: 0.6 });
        const slow = () => gsap.to(spin, { timeScale: 1, duration: 1.2 });
        el?.addEventListener("pointerenter", fast);
        el?.addEventListener("pointerleave", slow);
        return () => {
          el?.removeEventListener("pointerenter", fast);
          el?.removeEventListener("pointerleave", slow);
        };
      });
    },
    { scope: ref },
  );

  return (
    // Le positionnement (absolute, relative…) est fourni par `className`.
    <div ref={ref} className={cn("grid place-items-center", className)} aria-hidden>
      <svg ref={ringRef} viewBox="0 0 200 200" className="absolute inset-0 size-full">
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        {/* textLength = circonférence (2π × 78) : le texte fait exactement le tour du cercle. */}
        <text className="fill-current text-[15px] font-bold uppercase">
          <textPath href={`#${pathId}`} textLength={490} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      {children}
    </div>
  );
}

/** Fait flotter doucement son contenu (montée/descente et légère rotation). */
export function Float({
  children,
  className,
  y = 14,
  rotate = 6,
  duration = 3,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  rotate?: number;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(ref.current, { y: -y, rotate, duration, delay, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} aria-hidden>
      {children}
    </div>
  );
}

/** Jauge horizontale qui se remplit lorsqu'elle apparaît à l'écran. */
export function AnimatedBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const ratio = Math.min(1, Math.max(0, value));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(barRef.current, {
          scaleX: 0,
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: barRef.current, start: "top 95%", once: true },
        });
      });
    },
    { dependencies: [ratio], revertOnUpdate: true },
  );

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        ref={barRef}
        className={cn("h-full origin-left rounded-full", barClassName)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
