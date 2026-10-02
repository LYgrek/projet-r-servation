/**
 * Identité visuelle des types d'activité : une icône et un couple de couleurs.
 * L'association se fait par mots-clés dans le nom du type ; un type inconnu
 * reçoit un visuel par défaut choisi de façon stable à partir de son id.
 */
import {
  Bike,
  Crosshair,
  Flower2,
  Leaf,
  Mountain,
  Sparkles,
  TreePine,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TypeVisual {
  icon: LucideIcon;
  /** Classes de fond et de couleur de texte (les courbes de niveau prennent la couleur du texte). */
  colors: string;
}

const KEYWORD_VISUALS: { keywords: string[]; visual: TypeVisual }[] = [
  { keywords: ["accrobranche", "arbre", "tyrolienne"], visual: { icon: TreePine, colors: "bg-brand-700 text-lime" } },
  { keywords: ["escalade", "grimpe", "montagne"], visual: { icon: Mountain, colors: "bg-sun text-ink" } },
  { keywords: ["nautique", "canoë", "kayak", "paddle", "eau"], visual: { icon: Waves, colors: "bg-lagoon text-card" } },
  { keywords: ["paintball", "laser", "tir"], visual: { icon: Crosshair, colors: "bg-berry text-lime" } },
  { keywords: ["bien-être", "yoga", "relax"], visual: { icon: Flower2, colors: "bg-blush text-ink" } },
  { keywords: ["nature", "atelier", "forêt"], visual: { icon: Leaf, colors: "bg-lime text-brand-900" } },
  { keywords: ["vélo", "vtt", "cyclo"], visual: { icon: Bike, colors: "bg-amber-300 text-ink" } },
];

const FALLBACK_COLORS = ["bg-ink text-lime", "bg-sky-300 text-ink", "bg-brand-300 text-ink", "bg-sun-soft text-ink"];

/** Retourne l'icône et les couleurs associées à un type d'activité. */
export function getTypeVisual(typeNom: string, typeId: number): TypeVisual {
  const name = typeNom.toLocaleLowerCase("fr");
  const match = KEYWORD_VISUALS.find(({ keywords }) => keywords.some((keyword) => name.includes(keyword)));
  return match?.visual ?? { icon: Sparkles, colors: FALLBACK_COLORS[typeId % FALLBACK_COLORS.length]! };
}

/**
 * Bandeau d'une activité : aplat de couleur, courbes de niveau et grande
 * icône qui pivote au survol de la carte parente (classe `group`).
 */
export function TypeBanner({
  typeNom,
  typeId,
  className,
  iconClassName,
  children,
}: {
  typeNom: string;
  typeId: number;
  className?: string;
  iconClassName?: string;
  children?: ReactNode;
}) {
  const { icon: Icon, colors } = getTypeVisual(typeNom, typeId);
  return (
    <div className={cn("relative overflow-hidden bg-topo", colors, className)}>
      <Icon
        className={cn(
          "absolute -right-3 -bottom-4 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-12",
          iconClassName ?? "size-28",
        )}
        strokeWidth={1.25}
        aria-hidden
      />
      {children}
    </div>
  );
}
