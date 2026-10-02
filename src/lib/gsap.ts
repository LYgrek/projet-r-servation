"use client";

/**
 * Point d'entrée unique de GSAP : les plugins sont enregistrés une seule fois
 * et tous les composants animés importent `gsap` depuis ce fichier.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Requête média : l'utilisateur accepte les animations. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Requête média : l'utilisateur préfère réduire les animations. */
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

/** Rend immédiatement visibles des éléments masqués en attente d'animation. */
export function showNow(targets: gsap.TweenTarget): void {
  gsap.set(targets, { autoAlpha: 1, clearProps: "transform" });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
